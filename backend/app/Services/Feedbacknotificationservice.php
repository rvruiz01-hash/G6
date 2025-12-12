<?php

namespace App\Services;

use App\Models\Feedback;
use App\Models\FeedbackNotification;

class FeedbackNotificationService
{
    /**
     * Notificar a role_id = 1 (Administradores) sobre nuevo feedback
     */
    public static function notifyNewFeedback(Feedback $feedback)
    {
        FeedbackNotification::create([
            'feedback_id' => $feedback->id,
            'role_id' => 1, // 🎯 Notificar a role_id = 1
            'type' => 'new_feedback',
            'message' => "Nuevo reporte: {$feedback->title}",
            'data' => [
                'feedback_id' => $feedback->id,
                'user_name' => $feedback->user->name,
                'type' => $feedback->type,
                'priority' => $feedback->priority,
            ],
            'read' => false,
        ]);
    }

    /**
     * Notificar cambio de estado
     */
    public static function notifyStatusChange(Feedback $feedback, $oldStatus, $newStatus)
    {
        // Notificar al usuario que creó el feedback
        self::notifyUser($feedback, 'status_changed', "Estado cambiado: {$oldStatus} → {$newStatus}");
    }
    
    /**
     * Alias para compatibilidad
     */
    public static function notifyStatusChanged(Feedback $feedback, $oldStatus, $newStatus)
    {
        return self::notifyStatusChange($feedback, $oldStatus, $newStatus);
    }

    /**
     * Notificar nuevo mensaje en el chat
     */
    public static function notifyNewMessage(Feedback $feedback, $senderId)
    {
        // Si el que envió es admin, notificar al usuario
        // Si el que envió es usuario, notificar a admins (role_id = 1)
        
        $senderIsAdmin = \App\Models\User::find($senderId)->name === 'Admin';
        
        if ($senderIsAdmin) {
            // Admin envió mensaje -> notificar al usuario
            self::notifyUser($feedback, 'new_message', 'Nuevo mensaje del soporte');
        } else {
            // Usuario envió mensaje -> notificar a admins
            FeedbackNotification::create([
                'feedback_id' => $feedback->id,
                'role_id' => 1, // 🎯 Notificar a role_id = 1
                'type' => 'new_message',
                'message' => "Nuevo mensaje en: {$feedback->title}",
                'data' => ['feedback_id' => $feedback->id],
                'read' => false,
            ]);
        }
    }
    /**
     * Notificar resolución
     */
    public static function notifyResolution(Feedback $feedback)
    {
        self::notifyUser($feedback, 'resolved', "Tu reporte ha sido resuelto: {$feedback->title}");
    }
    
    /**
     * Alias para compatibilidad
     */
    public static function notifyResolved(Feedback $feedback)
    {
        return self::notifyResolution($feedback);
    }

    /**
     * Notificar reapertura
     */
    public static function notifyReopen(Feedback $feedback)
    {
        // Notificar a admins
        FeedbackNotification::create([
            'feedback_id' => $feedback->id,
            'role_id' => 1, // 🎯 Notificar a role_id = 1
            'type' => 'reopened',
            'message' => "Feedback reabierto: {$feedback->title}",
            'data' => ['feedback_id' => $feedback->id],
            'read' => false,
        ]);
    }
    
    /**
     * Alias para compatibilidad
     */
    public static function notifyReopened(Feedback $feedback)
    {
        return self::notifyReopen($feedback);
    }

    /**
     * Método auxiliar para notificar al usuario creador del feedback
     * (esto crea una notificación ligada al role que tenga el usuario)
     */
    private static function notifyUser(Feedback $feedback, $type, $message)
    {
        // Obtener el rol principal del usuario
        $user = $feedback->user;
        $primaryRole = $user->roles()->wherePivot('is_primary', true)->first();
        
        if ($primaryRole) {
            FeedbackNotification::create([
                'feedback_id' => $feedback->id,
                'role_id' => $primaryRole->id, // 🎯 Usar el role_id del usuario
                'type' => $type,
                'message' => $message,
                'data' => ['feedback_id' => $feedback->id],
                'read' => false,
            ]);
        }
    }
}