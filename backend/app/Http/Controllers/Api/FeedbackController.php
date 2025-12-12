<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;
use App\Mail\FeedbackReceived;
use App\Models\Feedback;
use App\Models\FeedbackMessage;
use App\Models\User;
use App\Models\Role;
use App\Services\FeedbackNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;


class FeedbackController extends Controller
{
    /**
     * Listar todo el feedback (para administradores)
     */
    public function index(Request $request)
    {
        $query = Feedback::with('user')
            ->orderBy('created_at', 'desc');

        // Filtros opcionales
        if ($request->has('status')) {
            $query->status($request->status);
        }

        if ($request->has('type')) {
            $query->type($request->type);
        }

        if ($request->has('priority')) {
            $query->priority($request->priority);
        }

        if ($request->has('module')) {
            $query->where('module', 'like', '%' . $request->module . '%');
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Obtener mis feedbacks (usuario normal)
     */
    public function myFeedbacks()
    {
        $feedbacks = Feedback::where('user_id', Auth::id())
            ->with(['resolver'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($feedbacks);
    }

    /**
     * Crear nuevo feedback
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'module' => 'required|string|max:255',
            'url' => 'required|string|max:500',
            'type' => 'required|in:error,improvement',
            'priority' => 'required|in:low,medium,high',
            'title' => 'required|string|min:10|max:100',
            'description' => 'required|string|min:20|max:500',
            'steps_to_reproduce' => 'nullable|required_if:type,error|string|min:20',
            'expected_behavior' => 'required|string|min:15',
            'actual_behavior' => 'required|string|min:15',
            'frequency' => 'nullable|required_if:type,error|in:always,sometimes,once',
            'affected_users' => 'required|string|min:5|max:255',
            'additional_info' => 'nullable|string|max:1000',
            'user_agent' => 'nullable|string',
            'screenshots.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        // Agregar el ID del usuario autenticado
        $validated['user_id'] = Auth::id();

        // 🎯 Manejar subida de capturas de pantalla
        $screenshotPaths = [];
        if ($request->hasFile('screenshots')) {
            foreach ($request->file('screenshots') as $index => $screenshot) {
                // Generar nombre único
                $fileName = time() . '_' . $index . '_' . uniqid() . '.' . $screenshot->getClientOriginalExtension();
                
                // Guardar en storage/app/public/feedback_screenshots
                $path = $screenshot->storeAs('feedback_screenshots', $fileName, 'public');
                
                $screenshotPaths[] = $path;
            }
        }
        // Agregar rutas al array validado
        $validated['screenshots'] = !empty($screenshotPaths) ? $screenshotPaths : null;
        $feedback = Feedback::create($validated);
        // 🎯 NOTIFICAR A ADMINS SOBRE NUEVO FEEDBACK
        FeedbackNotificationService::notifyNewFeedback($feedback);
        return response()->json([
            'message' => 'Feedback recibido exitosamente',
            'data' => $feedback
        ], 201);
    }

    /**
     * Ver un feedback específico
     */
    public function show($id)
    {
        $feedback = Feedback::with('user')->findOrFail($id);
        return response()->json($feedback);
    }

    /**
     * Actualizar estado del feedback (para administradores)
     */
    public function update(Request $request, $id)
    {
        $feedback = Feedback::findOrFail($id);
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,in_progress,resolved,rejected,reopened',
            'rejected_notes' => 'nullable|string|max:2000',
            'resolution_description' => 'nullable|string|max:5000',
            'resolution_version' => 'nullable|string|max:50',
        ]);

        // Si se está resolviendo
        if (isset($validated['status']) && $validated['status'] === 'resolved' && $feedback->status !== 'resolved') {
            $validated['resolved_at'] = now();
            $validated['resolved_by'] = Auth::id();
            // Calcular tiempo de resolución en minutos
            $validated['time_to_resolve'] = $feedback->created_at->diffInMinutes(now());
            // Crear mensaje del sistema
            FeedbackMessage::create([
                'feedback_id' => $feedback->id,
                'user_id' => Auth::id(),
                'message' => '✅ Este reporte ha sido marcado como resuelto.',
                'is_system' => true,
            ]);
        }
        // Guardar el estado anterior para notificaciones
        $oldStatus = $feedback->status;
        // Si cambia el estado
        if (isset($validated['status']) && $validated['status'] != $feedback->status) {
            $statusLabels = [
                'pending' => 'Pendiente',
                'in_progress' => 'En Progreso',
                'resolved' => 'Resuelto',
                'rejected' => 'Rechazado',
                'reopened' => 'Reabierto',
            ];
            
            FeedbackMessage::create([
                'feedback_id' => $feedback->id,
                'user_id' => Auth::id(),
                'message' => "🔄 Estado cambiado a: {$statusLabels[$validated['status']]}",
                'is_system' => true,
            ]);
        }
        $feedback->update($validated);
        // 🎯 NOTIFICACIONES DESPUÉS DE ACTUALIZAR
        // Si cambió el estado, notificar
        if (isset($validated['status']) && $validated['status'] != $oldStatus) {
            FeedbackNotificationService::notifyStatusChanged($feedback->fresh(), $oldStatus, $validated['status']);
            // Notificación especial si se resolvió
            if ($validated['status'] === 'resolved') {
                FeedbackNotificationService::notifyResolved($feedback->fresh());
            }
            // Notificación especial si se reabrió
            if ($validated['status'] === 'reopened') {
                FeedbackNotificationService::notifyReopened($feedback->fresh());
            }
        }

        return response()->json([
            'message' => 'Feedback actualizado exitosamente',
            'data' => $feedback->load(['user', 'resolver'])
        ]);
    }

    /**
     * Obtener estadísticas del feedback
     */
    public function statistics()
    {
        return response()->json([
            'total' => Feedback::count(),
            'by_status' => [
                'pending' => Feedback::status('pending')->count(),
                'in_progress' => Feedback::status('in_progress')->count(),
                'resolved' => Feedback::status('resolved')->count(),
                'rejected' => Feedback::status('rejected')->count(),
            ],
            'by_type' => [
                'errors' => Feedback::type('error')->count(),
                'improvements' => Feedback::type('improvement')->count(),
            ],
            'by_priority' => [
                'high' => Feedback::priority('high')->count(),
                'medium' => Feedback::priority('medium')->count(),
                'low' => Feedback::priority('low')->count(),
            ],
            'recent' => Feedback::with('user')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
        ]);
    }

    /**
     * Eliminar feedback
     */
    public function destroy($id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->delete();
        return response()->json([
            'message' => 'Feedback eliminado exitosamente'
        ]);
    }

    /**
     * 🎯 MÉTODOS DE CHAT
     */

    /**
     * Obtener mensajes de un feedback
     */
    public function getMessages($feedbackId)
    {
        $feedback = Feedback::findOrFail($feedbackId);
        // Si es admin, puede ver todos los mensajes
        // Si es usuario normal, solo puede ver mensajes públicos
        $query = $feedback->messages()->with('user');
        if (!Auth::user()->is_admin) {
            $query->where('is_internal', false);
        }
        $messages = $query->orderBy('created_at', 'asc')->get();
        return response()->json($messages);
    }

    /**
     * Enviar mensaje en el chat
     */
    public function sendMessage(Request $request, $feedbackId)
    {
        $feedback = Feedback::findOrFail($feedbackId);
        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'is_internal' => 'nullable|boolean',
            'attachments.*' => 'nullable|file|max:5120', // 5MB
        ]);

        // Solo admins pueden enviar mensajes internos
        if (!Auth::user()->is_admin) {
            $validated['is_internal'] = false;
        }

        // Procesar archivos adjuntos
        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $index => $file) {
                $fileName = time() . '_' . $index . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('chat_attachments', $fileName, 'public');
                $attachmentPaths[] = [
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ];
            }
        }

        $message = FeedbackMessage::create([
            'feedback_id' => $feedbackId,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
            'is_internal' => $validated['is_internal'] ?? false,
            'attachments' => !empty($attachmentPaths) ? $attachmentPaths : null,
        ]);

        // Incrementar contador de mensajes
        $feedback->increment('messages_count');
        
        // 🎯 NOTIFICAR NUEVO MENSAJE (solo si no es interno)
        if (!($validated['is_internal'] ?? false)) {
            FeedbackNotificationService::notifyNewMessage($feedback, Auth::id());
        }

        return response()->json([
            'message' => 'Mensaje enviado exitosamente',
            'data' => $message->load('user')
        ], 201);
    }

    /**
     * Marcar mensajes como leídos
     */
    public function markMessagesAsRead($feedbackId)
    {
        $feedback = Feedback::findOrFail($feedbackId);
        $feedback->messages()
            ->where('user_id', '!=', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Mensajes marcados como leídos'
        ]);
    }

    /**
     * 🎯 MÉTODOS DE NOTIFICACIONES
     */

    /**
     * Obtener notificaciones del usuario actual basadas en sus roles
     */
    public function getNotifications(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $userId = Auth::id();

        // Obtener todos los role_ids del usuario autenticado
        $userRoleIds = Auth::user()->roles->pluck('id')->toArray();

        // Consultar notificaciones donde role_id esté en los roles del usuario
        $notifications = \App\Models\FeedbackNotification::with(['feedback:id,title,type', 'readByUsers'])
            ->whereIn('role_id', $userRoleIds)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // 🎯 Agregar campo 'read' a cada notificación según si el usuario la ha leído
        $notifications->getCollection()->transform(function ($notification) use ($userId) {
            $notification->read = $notification->isReadBy($userId);
            $notification->read_at = $notification->readByUsers()
                ->where('user_id', $userId)
                ->first()
                ?->pivot
                ?->read_at;
            return $notification;
        });
        return response()->json($notifications);
    }

    /**
     * Obtener contador de notificaciones no leídas
     */
    public function getUnreadCount()
    {
        $userId = Auth::id();
        // Obtener todos los role_ids del usuario autenticado
        $userRoleIds = Auth::user()->roles->pluck('id')->toArray();
        // 🎯 Contar notificaciones que NO han sido leídas por este usuario
        $unreadCount = \App\Models\FeedbackNotification::whereIn('role_id', $userRoleIds)
            ->whereDoesntHave('readByUsers', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->count();
        return response()->json([
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * Marcar notificación como leída
     */
    public function markNotificationAsRead($notificationId)
    {
        $userId = Auth::id();
        // Obtener todos los role_ids del usuario autenticado
        $userRoleIds = Auth::user()->roles->pluck('id')->toArray();
        $notification = \App\Models\FeedbackNotification::whereIn('role_id', $userRoleIds)
            ->findOrFail($notificationId);
        // 🎯 Marcar como leída SOLO para este usuario
        $notification->markAsReadBy($userId);
        return response()->json([
            'message' => 'Notificación marcada como leída'
        ]);
    }

    /**
     * Marcar todas las notificaciones como leídas
     */
    public function markAllNotificationsAsRead()
    {
        $userId = Auth::id();
        // Obtener todos los role_ids del usuario autenticado
        $userRoleIds = Auth::user()->roles->pluck('id')->toArray();
        // 🎯 Obtener todas las notificaciones no leídas por este usuario
        $notifications = \App\Models\FeedbackNotification::whereIn('role_id', $userRoleIds)
            ->whereDoesntHave('readByUsers', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->get();

        // Marcar cada una como leída
        foreach ($notifications as $notification) {
            $notification->markAsReadBy($userId);
        }
        return response()->json([
            'message' => 'Todas las notificaciones marcadas como leídas'
        ]);
    }
}