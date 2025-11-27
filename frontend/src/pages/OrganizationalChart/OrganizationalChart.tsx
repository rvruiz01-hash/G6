import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Search,
  AlertCircle,
  AlertTriangle,
  Users,
  UserX,
} from "lucide-react";
import api from "../../../services/api";
import { getEmployeePhotoUrl } from "../../config/api_url"; 
import { get } from "http";

// ==========================================
// 1. TIPOS DE DATOS COMPLETOS
// ==========================================

interface Position {
  id: number;
  name: string;
  level: number;
  reports_to_position_id: number | null;
  business_line_id: number;
}

interface Employee {
  id: number;
  name: string;
  paternal_last_name: string;
  maternal_last_name: string;
  email: string;
  cellphone_number: string;
  photo?: string;
  position_id: number;
  manager_id: number | null;
  staffing_plan_id: number;
  emplioyee_status_id: number;
}

interface StaffingPlan {
  id: number;
  client_site_id: number;
}

interface ClientSite {
  id: number;
  business_line_id: number;
  federal_entity_id: string;
}

interface Region {
  id: number;
  name: string;
  regional_manager_id: number | null;
}

interface FederalEntity {
  id: string;
  name: string;
  region_id: number;
}

interface BusinessLine {
  id: number;
  name: string;
}

interface EmployeeInfo {
  id: number;
  full_name: string;
  email: string;
  cellphone_number: string;
  photo?: string;
  position_name: string;
  federal_entity?: string | null;
}

type NodeClassification =
  | "MAIN_TREE"
  | "VACANT"
  | "UNASSIGNED"
  | "INCONSISTENCY";

interface FlatNode {
  position_id: number;
  position_name: string;
  level: number;
  reports_to_position_id: number | null;
  business_line_id: number;
  employee?: EmployeeInfo | null;
  node_id: string;
  effective_parent_id: string | null;
  is_vacant: boolean;
  passes_filter: boolean;
  classification: NodeClassification;
  inconsistency_reason?: string;
}

interface TreeNode extends FlatNode {
  children: TreeNode[];
}

interface OrganizationTree {
  mainTree: TreeNode[];
  vacantNodes: FlatNode[];
  unassignedTree: TreeNode[];
  inconsistentTree: TreeNode[];
}

// ==========================================
// 2. DATOS DINÁMICOS - HOOKS
// ==========================================

function useOrganizationData() {
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [federalEntities, setFederalEntities] = useState<FederalEntity[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [clientSites, setClientSites] = useState<ClientSite[]>([]);
  const [staffingPlans, setStaffingPlans] = useState<StaffingPlan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Realizar todas las peticiones en paralelo
      const [
        businessLinesRes,
        regionsRes,
        federalEntitiesRes,
        positionsRes,
        clientSitesRes,
        staffingPlansRes,
        employeesRes,
      ] = await Promise.all([
        api.get("/business-lines"),
        api.get("/regions"),
        api.get("/federal-entities"),
        api.get("/positions"),
        api.get("/client-sites"),
        api.get("/staffing-plans"),
        api.get("/employees"),
      ]);

      setBusinessLines(businessLinesRes.data);
      setRegions(regionsRes.data);
      setFederalEntities(federalEntitiesRes.data);
      setPositions(positionsRes.data);
      setClientSites(clientSitesRes.data);
      setStaffingPlans(staffingPlansRes.data);
      setEmployees(employeesRes.data);
    } catch (err: any) {
      console.error("Error al cargar datos del organigrama:", err);
      setError(
        err.response?.data?.message ||
          "Error al cargar los datos del organigrama"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    businessLines,
    regions,
    federalEntities,
    positions,
    clientSites,
    staffingPlans,
    employees,
    loading,
    error,
    refetch: fetchAllData,
  };
}

// ==========================================
// 3. FUNCIONES AUXILIARES
// ==========================================

function employeePassesFilter(
  employee: Employee,
  filterBusinessLineId: number,
  filterFederalEntityId: string | null,
  staffingPlans: StaffingPlan[],
  clientSites: ClientSite[]
): boolean {
  const staffingPlan = staffingPlans.find(
    (sp) => sp.id === employee.staffing_plan_id
  );
  if (!staffingPlan) return false;

  const clientSite = clientSites.find(
    (cs) => cs.id === staffingPlan.client_site_id
  );
  if (!clientSite) return false;

  if (clientSite.business_line_id !== filterBusinessLineId) return false;

  if (
    filterFederalEntityId &&
    clientSite.federal_entity_id !== filterFederalEntityId
  ) {
    return false;
  }

  return true;
}

function getEmployeeFederalEntity(
  employee: Employee,
  staffingPlans: StaffingPlan[],
  clientSites: ClientSite[]
): string | null {
  const plan = staffingPlans.find((sp) => sp.id === employee.staffing_plan_id);
  if (!plan) return null;

  const site = clientSites.find((cs) => cs.id === plan.client_site_id);
  return site?.federal_entity_id || null;
}

function getRegionForEntity(
  federalEntityId: string,
  federalEntities: FederalEntity[],
  regions: Region[]
): Region | null {
  const entity = federalEntities.find((fe) => fe.id === federalEntityId);
  if (!entity) return null;

  return regions.find((r) => r.id === entity.region_id) || null;
}

function getEmployeeFederalEntityName(
  employee: Employee,
  staffingPlans: StaffingPlan[],
  clientSites: ClientSite[],
  federalEntities: FederalEntity[]
): string | null {
  const entityId = getEmployeeFederalEntity(
    employee,
    staffingPlans,
    clientSites
  );
  if (!entityId) return null;

  const entity = federalEntities.find((fe) => fe.id === entityId);
  return entity?.name || null;
}

// ==========================================
// 4. FUNCIÓN DE CLASIFICACIÓN Y FILTRADO
// ==========================================

function calculateFilteredData(
  positions: Position[],
  employees: Employee[],
  filterBusinessLineId: number,
  filterFederalEntityId: string | null,
  staffingPlans: StaffingPlan[],
  clientSites: ClientSite[],
  federalEntities: FederalEntity[],
  regions: Region[]
): FlatNode[] {
  const filteredPositions = positions.filter(
    (pos) => pos.business_line_id === filterBusinessLineId
  );

  const employeesById = new Map(employees.map((e) => [e.id, e]));
  const filteredPositionsMap = new Map(filteredPositions.map((p) => [p.id, p]));

  const employeesByPosition = new Map<number, Employee[]>();
  employees.forEach((emp) => {
    if (
      employeePassesFilter(
        emp,
        filterBusinessLineId,
        filterFederalEntityId,
        staffingPlans,
        clientSites
      )
    ) {
      if (!employeesByPosition.has(emp.position_id)) {
        employeesByPosition.set(emp.position_id, []);
      }
      employeesByPosition.get(emp.position_id)!.push(emp);
    }
  });

  const allNodes: FlatNode[] = [];

  filteredPositions.forEach((position) => {
    const employeesInPosition = employeesByPosition.get(position.id) || [];

    if (employeesInPosition.length === 0) {
      allNodes.push(createVacantNode(position));
    } else {
      employeesInPosition.forEach((employee) => {
        const node = createEmployeeNode(
          position,
          employee,
          employeesById,
          filteredPositionsMap,
          filterBusinessLineId,
          filterFederalEntityId,
          staffingPlans,
          clientSites,
          federalEntities,
          regions
        );
        allNodes.push(node);
      });
    }
  });

  propagateClassifications(allNodes);

  return allNodes;
}

function createVacantNode(position: Position): FlatNode {
  return {
    position_id: position.id,
    position_name: position.name,
    level: position.level,
    reports_to_position_id: position.reports_to_position_id,
    business_line_id: position.business_line_id,
    employee: null,
    node_id: `p${position.id}`,
    effective_parent_id: null,
    is_vacant: true,
    passes_filter: false,
    classification: "VACANT",
  };
}

function createEmployeeNode(
  position: Position,
  employee: Employee,
  employeesById: Map<number, Employee>,
  positionsMap: Map<number, Position>,
  filterBusinessLineId: number,
  filterFederalEntityId: string | null,
  staffingPlans: StaffingPlan[],
  clientSites: ClientSite[],
  federalEntities: FederalEntity[],
  regions: Region[]
): FlatNode {
  const employeeInfo: EmployeeInfo = {
    id: employee.id,
    full_name: getFullName(employee),
    email: employee.email,
    cellphone_number: employee.cellphone_number,
    photo: getEmployeePhotoUrl(employee.photo),
    position_name: position.name,
    federal_entity: getEmployeeFederalEntityName(
      employee,
      staffingPlans,
      clientSites,
      federalEntities
    ),
  };

  const nodeId = `e${employee.id}`;

  const { classification, effectiveParentId, inconsistencyReason } =
    determineNodeClassification(
      employee,
      position,
      employeesById,
      positionsMap,
      filterBusinessLineId,
      filterFederalEntityId,
      staffingPlans,
      clientSites,
      federalEntities,
      regions
    );

  return {
    position_id: position.id,
    position_name: position.name,
    level: position.level,
    reports_to_position_id: position.reports_to_position_id,
    business_line_id: position.business_line_id,
    employee: employeeInfo,
    node_id: nodeId,
    effective_parent_id: effectiveParentId,
    is_vacant: false,
    passes_filter: true,
    classification: classification,
    inconsistency_reason: inconsistencyReason,
  };
}

function determineNodeClassification(
  employee: Employee,
  position: Position,
  employeesById: Map<number, Employee>,
  positionsMap: Map<number, Position>,
  filterBusinessLineId: number,
  filterFederalEntityId: string | null,
  staffingPlans: StaffingPlan[],
  clientSites: ClientSite[],
  federalEntities: FederalEntity[],
  regions: Region[]
): {
  classification: NodeClassification;
  effectiveParentId: string | null;
  inconsistencyReason?: string;
} {
  if (position.level === 1) {
    return {
      classification: "MAIN_TREE",
      effectiveParentId: null,
    };
  }

  if (employee.manager_id === null) {
    if (position.name === "Supervisor") {
      const entityId = getEmployeeFederalEntity(
        employee,
        staffingPlans,
        clientSites
      );
      const region = entityId
        ? getRegionForEntity(entityId, federalEntities, regions)
        : null;

      if (region && region.regional_manager_id === null) {
        return {
          classification: "UNASSIGNED",
          effectiveParentId: null,
          inconsistencyReason: `Región ${region.name} sin gerente regional asignado`,
        };
      }
    }

    return {
      classification: "UNASSIGNED",
      effectiveParentId: null,
      inconsistencyReason: "No tiene jefe asignado",
    };
  }

  const manager = employeesById.get(employee.manager_id);
  if (!manager) {
    return {
      classification: "INCONSISTENCY",
      effectiveParentId: null,
      inconsistencyReason: "Manager no existe en la base de datos",
    };
  }

  if (
    !employeePassesFilter(
      manager,
      filterBusinessLineId,
      filterFederalEntityId,
      staffingPlans,
      clientSites
    )
  ) {
    return {
      classification: "UNASSIGNED",
      effectiveParentId: null,
      inconsistencyReason: "Manager filtrado (otra línea/entidad)",
    };
  }

  if (position.name === "Supervisor") {
    const entityId = getEmployeeFederalEntity(
      employee,
      staffingPlans,
      clientSites
    );
    const region = entityId
      ? getRegionForEntity(entityId, federalEntities, regions)
      : null;

    if (!region) {
      return {
        classification: "INCONSISTENCY",
        effectiveParentId: null,
        inconsistencyReason: "No se pudo determinar la región del supervisor",
      };
    }

    if (region.regional_manager_id === null) {
      return {
        classification: "INCONSISTENCY",
        effectiveParentId: null,
        inconsistencyReason: `Tiene manager pero región ${region.name} no tiene gerente regional`,
      };
    }

    if (employee.manager_id !== region.regional_manager_id) {
      const managerEntity = getEmployeeFederalEntity(
        manager,
        staffingPlans,
        clientSites
      );
      const managerRegion = managerEntity
        ? getRegionForEntity(managerEntity, federalEntities, regions)
        : null;

      return {
        classification: "INCONSISTENCY",
        effectiveParentId: null,
        inconsistencyReason: `Reporta a gerente de ${
          managerRegion?.name || "región desconocida"
        } pero está en ${region.name}`,
      };
    }
  }

  return {
    classification: "MAIN_TREE",
    effectiveParentId: `e${employee.manager_id}`,
  };
}

function propagateClassifications(nodes: FlatNode[]): void {
  const nodeMap = new Map(nodes.map((n) => [n.node_id, n]));

  const propagate = (
    nodeId: string,
    targetClassification: NodeClassification
  ) => {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    nodes.forEach((child) => {
      if (
        child.effective_parent_id === nodeId &&
        child.classification === "MAIN_TREE"
      ) {
        child.classification = targetClassification;
        if (!child.inconsistency_reason) {
          const classificationText =
            targetClassification === "INCONSISTENCY"
              ? "INCONSISTENCIA"
              : targetClassification === "UNASSIGNED"
              ? "SIN ASIGNAR"
              : targetClassification;

          child.inconsistency_reason = `Padre (${
            node.employee?.name || node.position_name
          }) está en ${classificationText}`;
        }
        propagate(child.node_id, targetClassification);
      }
    });
  };

  nodes.forEach((node) => {
    if (
      node.classification === "UNASSIGNED" ||
      node.classification === "INCONSISTENCY"
    ) {
      propagate(node.node_id, node.classification);
    }
  });

  let changed = true;
  let iterations = 0;
  const MAX_ITERATIONS = 10;

  while (changed && iterations < MAX_ITERATIONS) {
    changed = false;
    iterations++;

    nodes.forEach((node) => {
      if (node.classification === "MAIN_TREE" && node.effective_parent_id) {
        const parent = nodeMap.get(node.effective_parent_id);

        if (parent && parent.classification !== "MAIN_TREE") {
          node.classification = parent.classification;
          if (!node.inconsistency_reason) {
            const classificationText =
              parent.classification === "INCONSISTENCY"
                ? "INCONSISTENCIA"
                : parent.classification === "UNASSIGNED"
                ? "SIN ASIGNAR"
                : parent.classification;

            node.inconsistency_reason = `Padre (${
              parent.employee?.name || parent.position_name
            }) está en ${parent.classificationText}`;
          }
          changed = true;
        }
      }
    });
  }
}

// ==========================================
// 5. CONSTRUCCIÓN DEL ÁRBOL
// ==========================================

function buildTree(
  flatNodes: FlatNode[],
  employees: Employee[]
): OrganizationTree {
  const mainTreeNodes = flatNodes.filter(
    (n) => n.classification === "MAIN_TREE"
  );
  const vacantNodes = flatNodes.filter((n) => n.classification === "VACANT");
  const unassignedNodes = flatNodes.filter(
    (n) => n.classification === "UNASSIGNED"
  );
  const inconsistentNodes = flatNodes.filter(
    (n) => n.classification === "INCONSISTENCY"
  );

  const mainTree = buildTreeFromNodes(mainTreeNodes);
  const unassignedTree = buildTreeFromNodes(unassignedNodes);

  const inconsistentTree = buildInconsistentTreeWithContext(
    flatNodes,
    inconsistentNodes,
    employees
  );

  return {
    mainTree,
    vacantNodes,
    unassignedTree,
    inconsistentTree,
  };
}

function buildTreeFromNodes(nodes: FlatNode[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();

  nodes.forEach((node) => {
    nodeMap.set(node.node_id, { ...node, children: [] });
  });

  const rootNodes: TreeNode[] = [];

  nodes.forEach((node) => {
    const treeNode = nodeMap.get(node.node_id)!;

    if (node.effective_parent_id === null) {
      rootNodes.push(treeNode);
    } else {
      const parentNode = nodeMap.get(node.effective_parent_id);
      if (parentNode) {
        parentNode.children.push(treeNode);
      } else {
        rootNodes.push(treeNode);
      }
    }
  });

  const sortChildren = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.position_name.localeCompare(b.position_name);
    });
    node.children.forEach((child) => sortChildren(child));
  };

  rootNodes.forEach((node) => sortChildren(node));

  return rootNodes;
}

function buildInconsistentTreeWithContext(
  allNodes: FlatNode[],
  inconsistentNodes: FlatNode[],
  employees: Employee[]
): TreeNode[] {
  const nodesToShow = new Set<string>();
  const nodesById = new Map(allNodes.map((n) => [n.node_id, n]));

  inconsistentNodes.forEach((node) => {
    nodesToShow.add(node.node_id);

    if (node.employee) {
      const employee = employees.find((e) => e.id === node.employee!.id);
      if (employee && employee.manager_id) {
        const managerId = `e${employee.manager_id}`;

        const managerNode = allNodes.find((n) => n.node_id === managerId);
        if (managerNode) {
          nodesToShow.add(managerId);
        }
      }
    }
  });

  const contextNodes: FlatNode[] = [];

  nodesToShow.forEach((nodeId) => {
    const node = nodesById.get(nodeId);
    if (node) {
      const isInconsistent = inconsistentNodes.some(
        (n) => n.node_id === nodeId
      );

      if (isInconsistent) {
        contextNodes.push(node);
      } else {
        contextNodes.push({
          ...node,
          inconsistency_reason: `[CONTEXTO] Manager real del empleado inconsistente`,
        });
      }
    }
  });

  return buildTreeFromContextNodes(contextNodes, employees);
}

function buildTreeFromContextNodes(
  nodes: FlatNode[],
  employees: Employee[]
): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();

  nodes.forEach((node) => {
    nodeMap.set(node.node_id, { ...node, children: [] });
  });

  const rootNodes: TreeNode[] = [];

  nodes.forEach((node) => {
    const treeNode = nodeMap.get(node.node_id)!;

    let realParentId: string | null = null;

    if (node.employee) {
      const employee = employees.find((e) => e.id === node.employee!.id);
      if (employee && employee.manager_id) {
        realParentId = `e${employee.manager_id}`;
      }
    }

    if (realParentId === null || !nodeMap.has(realParentId)) {
      rootNodes.push(treeNode);
    } else {
      const parentNode = nodeMap.get(realParentId);
      if (parentNode) {
        parentNode.children.push(treeNode);
      } else {
        rootNodes.push(treeNode);
      }
    }
  });

  const sortChildren = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.position_name.localeCompare(b.position_name);
    });
    node.children.forEach((child) => sortChildren(child));
  };

  rootNodes.forEach((node) => sortChildren(node));

  return rootNodes;
}

// ==========================================
// 6. COMPONENTE DE NODO
// ==========================================

interface OrgNodeProps {
  node: TreeNode;
  searchTerm: string;
  showFederalEntity: boolean;
}

const OrgNode: React.FC<OrgNodeProps> = ({
  node,
  searchTerm,
  showFederalEntity,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const matchesSearch = (n: TreeNode, term: string): boolean => {
    if (!term) return true;

    const searchLower = term.toLowerCase();
    const matchesNode =
      n.position_name.toLowerCase().includes(searchLower) ||
      n.employee?.full_name.toLowerCase().includes(searchLower) ||
      n.employee?.email.toLowerCase().includes(searchLower);

    const matchesChildren = n.children.some((child) =>
      matchesSearch(child, term)
    );
    return matchesNode || matchesChildren;
  };

  const visibleChildren = node.children.filter((child) =>
    matchesSearch(child, searchTerm)
  );

  if (!matchesSearch(node, searchTerm)) {
    return null;
  }

  const hasChildren = visibleChildren.length > 0;
  const isVacant = node.is_vacant;
  const isContext = node.inconsistency_reason?.includes("[CONTEXTO]");

  return (
    <li className="org-node-item">
      <div className="org-node-wrapper">
        <div
          className={`org-node-card ${
            isVacant
              ? "org-node-vacant"
              : isContext
              ? "org-node-context"
              : "org-node-filled"
          }`}
        >
          <div className="org-node-header">
            <div className="org-node-avatar">
              {isVacant ? (
                <div className="org-node-avatar-vacant">
                  <AlertCircle size={24} />
                </div>
              ) : (
                <img
                  src={
                    node.employee?.photo ||
                    `https://i.pravatar.cc/150?img=${node.position_id}`
                  }
                  alt={node.employee?.full_name || "Vacante"}
                  className="org-node-avatar-img"
                />
              )}
            </div>

            <div className="org-node-info">
              <h3 className="org-node-name">
                {isVacant ? "Posición Vacante" : node.employee?.full_name}
              </h3>
              <p className="org-node-position">{node.position_name}</p>
              <div className="org-node-badges-row">
                <div className="org-node-level-badge">Nivel {node.level}</div>
                {showFederalEntity &&
                  !isVacant &&
                  node.employee?.federal_entity && (
                    <div className="org-node-entity-badge">
                      📍 {node.employee.federal_entity}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {!isVacant && node.employee && (
            <div className="org-node-contact">
              <div className="org-node-contact-item">
                <Mail size={14} />
                <span className="org-node-contact-text">
                  {node.employee.email}
                </span>
              </div>
              <div className="org-node-contact-item">
                <Phone size={14} />
                <span className="org-node-contact-text">
                  {node.employee.cellphone_number}
                </span>
              </div>
            </div>
          )}

          {isVacant && (
            <div className="org-node-vacant-badge">
              <AlertCircle size={16} />
              <span>Vacante Disponible</span>
            </div>
          )}

          {node.inconsistency_reason && (
            <div
              className={`${
                isContext
                  ? "org-node-context-badge"
                  : "org-node-inconsistency-badge"
              }`}
            >
              <AlertTriangle size={16} />
              <span className="text-xs">
                {isContext
                  ? "Manager real (para contexto)"
                  : node.inconsistency_reason}
              </span>
            </div>
          )}

          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="org-node-expand-btn"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} />
                  <span className="hidden sm:inline">Colapsar</span>
                  <span className="sm:hidden">({visibleChildren.length})</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span className="hidden sm:inline">
                    Expandir ({visibleChildren.length})
                  </span>
                  <span className="sm:hidden">({visibleChildren.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <ul>
          {visibleChildren.map((child) => (
            <OrgNode
              key={child.node_id}
              node={child}
              searchTerm={searchTerm}
              showFederalEntity={showFederalEntity}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

function getFullName(employee: Employee): string {
  return `${employee.name} ${employee.paternal_last_name} ${employee.maternal_last_name}`.trim();
}

// ==========================================
// 7. COMPONENTE PRINCIPAL
// ==========================================

export default function Organigrama() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessLine, setSelectedBusinessLine] = useState<number>(1);
  const [selectedFederalEntity, setSelectedFederalEntity] = useState<
    string | null
  >(null);

  const mainTreeRef = React.useRef<HTMLDivElement>(null);
  const unassignedTreeRef = React.useRef<HTMLDivElement>(null);
  const inconsistentTreeRef = React.useRef<HTMLDivElement>(null);

  // 🔥 CARGAR DATOS DINÁMICAMENTE
  const organizationData = useOrganizationData();

  const {
    businessLines,
    regions,
    federalEntities,
    positions,
    clientSites,
    staffingPlans,
    employees,
    loading,
    error,
    refetch,
  } = organizationData;

  const filteredData = useMemo(() => {
    if (loading) return [];

    return calculateFilteredData(
      positions,
      employees,
      selectedBusinessLine,
      selectedFederalEntity,
      staffingPlans,
      clientSites,
      federalEntities,
      regions
    );
  }, [
    positions,
    employees,
    selectedBusinessLine,
    selectedFederalEntity,
    staffingPlans,
    clientSites,
    federalEntities,
    regions,
    loading,
  ]);

  const organizationTree = useMemo(() => {
    if (loading) {
      return {
        mainTree: [],
        vacantNodes: [],
        unassignedTree: [],
        inconsistentTree: [],
      };
    }

    return buildTree(filteredData, employees);
  }, [filteredData, employees, loading]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const mainTree = filteredData.filter(
      (n) => n.classification === "MAIN_TREE"
    ).length;
    const vacant = filteredData.filter(
      (n) => n.classification === "VACANT"
    ).length;
    const unassigned = filteredData.filter(
      (n) => n.classification === "UNASSIGNED"
    ).length;
    const inconsistent = filteredData.filter(
      (n) => n.classification === "INCONSISTENCY"
    ).length;

    return { total, mainTree, vacant, unassigned, inconsistent };
  }, [filteredData]);

  useEffect(() => {
    const centerScroll = (ref: React.RefObject<HTMLDivElement>) => {
      if (ref.current) {
        const container = ref.current;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const scrollLeft = (scrollWidth - clientWidth) / 2;
        container.scrollLeft = scrollLeft;
      }
    };

    setTimeout(() => {
      centerScroll(mainTreeRef);
      centerScroll(unassignedTreeRef);
      centerScroll(inconsistentTreeRef);
    }, 100);
  }, [organizationTree, selectedBusinessLine, selectedFederalEntity]);

  // 🔄 ESTADO DE CARGA
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando organigrama...
          </p>
        </div>
      </div>
    );
  }

  // ❌ ESTADO DE ERROR
  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Error al cargar datos
            </h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ✅ Verificar que haya líneas de negocio antes de renderizar
  if (businessLines.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 max-w-md text-center">
          <AlertCircle
            className="mx-auto text-yellow-600 dark:text-yellow-400 mb-4"
            size={48}
          />
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            No hay líneas de negocio
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            No se encontraron líneas de negocio en el sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ... (mantén todos los estilos CSS existentes) ... */
        .org-chart-tree {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: inline-flex;
          justify-content: center;
          padding: 20px;
          min-width: 100%;
        }
        
        .org-chart-tree ul {
          padding-top: 20px;
          position: relative;
          transition: all 0.3s;
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: nowrap;
        }
        
        .org-chart-tree li {
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 20px 20px 0 20px;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .org-chart-tree > ul > li::before,
        .org-chart-tree > ul > li::after {
          display: none !important;
        }
        
        .org-chart-tree > ul::before {
          display: none !important;
        }
        
        .org-chart-tree ul ul li::before,
        .org-chart-tree ul ul li::after {
          content: '';
          position: absolute;
          top: 0;
          width: 50%;
          height: 20px;
          border-top: 2px solid;
        }
        
        .dark .org-chart-tree ul ul li::before,
        .dark .org-chart-tree ul ul li::after {
          border-color: rgb(75 85 99);
        }
        
        :not(.dark) .org-chart-tree ul ul li::before,
        :not(.dark) .org-chart-tree ul ul li::after {
          border-color: rgb(203 213 225);
        }
        
        .org-chart-tree ul ul li::before {
          right: 50%;
        }
        
        .org-chart-tree ul ul li::after {
          left: 50%;
        }
        
        .dark .org-chart-tree ul ul li::after {
          border-left: 2px solid rgb(75 85 99);
        }
        
        :not(.dark) .org-chart-tree ul ul li::after {
          border-left: 2px solid rgb(203 213 225);
        }
        
        .org-chart-tree li:only-child::after,
        .org-chart-tree li:only-child::before {
          display: none;
        }
        
        .org-chart-tree li:only-child {
          padding-top: 0;
        }
        
        .org-chart-tree li:first-child::before,
        .org-chart-tree li:last-child::after {
          border: 0 none;
        }
        
        .dark .org-chart-tree ul ul li:last-child::before {
          border-right: 2px solid rgb(75 85 99);
          border-radius: 0 5px 0 0;
        }
        
        :not(.dark) .org-chart-tree ul ul li:last-child::before {
          border-right: 2px solid rgb(203 213 225);
          border-radius: 0 5px 0 0;
        }
        
        .org-chart-tree ul ul li:first-child::after {
          border-radius: 5px 0 0 0;
        }
        
        .dark .org-chart-tree ul ul::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 2px solid rgb(75 85 99);
          width: 0;
          height: 20px;
        }
        
        :not(.dark) .org-chart-tree ul ul::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 2px solid rgb(203 213 225);
          width: 0;
          height: 20px;
        }
        
        .org-node-wrapper {
          display: inline-block;
        }
        
        .org-node-card {
          padding: 16px;
          border-radius: 12px;
          display: inline-block;
          position: relative;
          transition: all 0.3s;
          min-width: 260px;
          max-width: 300px;
          width: 100%;
        }
        
        :not(.dark) .org-node-card {
          background: white;
          border: 2px solid rgb(226 232 240);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .dark .org-node-card {
          background: rgb(31 41 55);
          border: 2px solid rgb(55 65 81);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }
        
        .org-node-card:hover {
          transform: translateY(-2px);
        }
        
        :not(.dark) .org-node-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .dark .org-node-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
        }
        
        :not(.dark) .org-node-filled {
          border-color: rgb(59 130 246);
        }
        
        .dark .org-node-filled {
          border-color: rgb(96 165 250);
        }
        
        :not(.dark) .org-node-vacant {
          border-color: rgb(239 68 68);
          border-style: dashed;
          background: rgb(254 242 242);
        }
        
        .dark .org-node-vacant {
          border-color: rgb(248 113 113);
          border-style: dashed;
          background: rgb(127 29 29);
        }
        
        :not(.dark) .org-node-context {
          border-color: rgb(59 130 246);
          border-style: solid;
          background: rgb(239 246 255);
          opacity: 0.85;
        }
        
        .dark .org-node-context {
          border-color: rgb(96 165 250);
          border-style: solid;
          background: rgb(30 58 138);
          opacity: 0.85;
        }
        
        .org-node-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .org-node-avatar {
          flex-shrink: 0;
        }
        
        .org-node-avatar-img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        :not(.dark) .org-node-avatar-img {
          border: 3px solid rgb(59 130 246);
        }
        
        .dark .org-node-avatar-img {
          border: 3px solid rgb(96 165 250);
        }
        
        .org-node-avatar-vacant {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        :not(.dark) .org-node-avatar-vacant {
          background: rgb(254 226 226);
          color: rgb(220 38 38);
        }
        
        .dark .org-node-avatar-vacant {
          background: rgb(153 27 27);
          color: rgb(248 113 113);
        }
        
        .org-node-info {
          flex: 1;
          text-align: left;
        }
        
        .org-node-name {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }
        
        :not(.dark) .org-node-name {
          color: rgb(30 41 59);
        }
        
        .dark .org-node-name {
          color: rgb(243 244 246);
        }
        
        .org-node-position {
          font-size: 13px;
          margin: 0 0 6px 0;
        }
        
        :not(.dark) .org-node-position {
          color: rgb(100 116 139);
        }
        
        .dark .org-node-position {
          color: rgb(156 163 175);
        }
        
        .org-node-badges-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        
        .org-node-level-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
        }
        
        :not(.dark) .org-node-level-badge {
          background: rgb(219 234 254);
          color: rgb(30 64 175);
        }
        
        .dark .org-node-level-badge {
          background: rgb(30 58 138);
          color: rgb(191 219 254);
        }
        
        .org-node-entity-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
        }
        
        :not(.dark) .org-node-entity-badge {
          background: rgb(220 252 231);
          color: rgb(22 101 52);
        }
        
        .dark .org-node-entity-badge {
          background: rgb(20 83 45);
          color: rgb(187 247 208);
        }
        
        .org-node-contact {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 12px;
          padding-top: 12px;
        }
        
        :not(.dark) .org-node-contact {
          border-top: 1px solid rgb(226 232 240);
        }
        
        .dark .org-node-contact {
          border-top: 1px solid rgb(55 65 81);
        }
        
        .org-node-contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        
        :not(.dark) .org-node-contact-item {
          color: rgb(100 116 139);
        }
        
        .dark .org-node-contact-item {
          color: rgb(156 163 175);
        }
        
        .org-node-contact-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .org-node-vacant-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          margin-top: 8px;
        }
        
        :not(.dark) .org-node-vacant-badge {
          background: rgb(254 226 226);
          color: rgb(220 38 38);
        }
        
        .dark .org-node-vacant-badge {
          background: rgb(153 27 27);
          color: rgb(248 113 113);
        }
        
        .org-node-inconsistency-badge {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          padding: 8px;
          border-radius: 6px;
          font-size: 11px;
          margin-top: 8px;
        }
        
        :not(.dark) .org-node-inconsistency-badge {
          background: rgb(254 243 199);
          color: rgb(146 64 14);
        }
        
        .dark .org-node-inconsistency-badge {
          background: rgb(120 53 15);
          color: rgb(253 224 71);
        }
        
        .org-node-context-badge {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          padding: 8px;
          border-radius: 6px;
          font-size: 11px;
          margin-top: 8px;
        }
        
        :not(.dark) .org-node-context-badge {
          background: rgb(219 234 254);
          color: rgb(30 64 175);
          border: 1px solid rgb(59 130 246);
        }
        
        .dark .org-node-context-badge {
          background: rgb(30 58 138);
          color: rgb(191 219 254);
          border: 1px solid rgb(96 165 250);
        }
        
        .org-node-expand-btn {
          width: 100%;
          margin-top: 12px;
          padding: 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
        }
        
        :not(.dark) .org-node-expand-btn {
          background: rgb(241 245 249);
          border: 1px solid rgb(203 213 225);
          color: rgb(71 85 105);
        }
        
        .dark .org-node-expand-btn {
          background: rgb(55 65 81);
          border: 1px solid rgb(75 85 99);
          color: rgb(209 213 219);
        }
        
        :not(.dark) .org-node-expand-btn:hover {
          background: rgb(226 232 240);
        }
        
        .dark .org-node-expand-btn:hover {
          background: rgb(75 85 99);
        }
        
        .section-header {
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        :not(.dark) .section-header {
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .dark .section-header {
          background: rgb(31 41 55);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        
        .section-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .vacant-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          padding: 20px;
        }
        
        .vacant-card {
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }
        
        :not(.dark) .vacant-card {
          background: rgb(254 242 242);
          border: 2px dashed rgb(239 68 68);
        }
        
        .dark .vacant-card {
          background: rgb(127 29 29);
          border: 2px dashed rgb(248 113 113);
        }
        
        @media (max-width: 640px) {
          .org-node-card {
            min-width: 220px;
            max-width: 260px;
            padding: 12px;
          }
          
          .org-chart-tree ul {
            gap: 20px;
          }
          
          .org-chart-tree li {
            padding: 20px 10px 0 10px;
          }
        }
        
        .org-chart-container {
          width: 100%;
          overflow-x: auto;
          overflow-y: visible;
          padding: 20px 0;
          scroll-behavior: smooth;
          position: relative;
        }
        
        .org-chart-inner-wrapper {
          display: inline-block;
          min-width: 100%;
        }
        
        .org-chart-container::-webkit-scrollbar {
          height: 12px;
        }
        
        :not(.dark) .org-chart-container::-webkit-scrollbar-track {
          background: rgb(241 245 249);
          border-radius: 6px;
          margin: 0 10px;
        }
        
        .dark .org-chart-container::-webkit-scrollbar-track {
          background: rgb(55 65 81);
          border-radius: 6px;
          margin: 0 10px;
        }
        
        :not(.dark) .org-chart-container::-webkit-scrollbar-thumb {
          background: rgb(148 163 184);
          border-radius: 6px;
          border: 2px solid rgb(241 245 249);
        }
        
        .dark .org-chart-container::-webkit-scrollbar-thumb {
          background: rgb(107 114 128);
          border-radius: 6px;
          border: 2px solid rgb(55 65 81);
        }
        
        :not(.dark) .org-chart-container::-webkit-scrollbar-thumb:hover {
          background: rgb(100 116 139);
        }
        
        .dark .org-chart-container::-webkit-scrollbar-thumb:hover {
          background: rgb(75 85 99);
        }
        
        .org-chart-container::before,
        .org-chart-container::after {
          display: none;
        }
      `}</style>

      <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            Organigrama Empresarial
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </div>
              <div className="text-xs text-blue-800 dark:text-blue-300">
                Total Nodos
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.mainTree}
              </div>
              <div className="text-xs text-green-800 dark:text-green-300">
                Árbol Principal
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.vacant}
              </div>
              <div className="text-xs text-red-800 dark:text-red-300">
                Vacantes
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.unassigned}
              </div>
              <div className="text-xs text-orange-800 dark:text-orange-300">
                Sin Asignar
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.inconsistent}
              </div>
              <div className="text-xs text-yellow-800 dark:text-yellow-300">
                Inconsistencias
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Línea de Negocio:
              </label>
              <select
                value={selectedBusinessLine}
                onChange={(e) =>
                  setSelectedBusinessLine(Number(e.target.value))
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {businessLines.map((bl) => (
                  <option key={bl.id} value={bl.id}>
                    {bl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Entidad Federativa:
              </label>
              <select
                value={selectedFederalEntity || ""}
                onChange={(e) =>
                  setSelectedFederalEntity(e.target.value || null)
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Todas --</option>
                {federalEntities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, puesto o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {organizationTree.mainTree.length > 0 && (
          <div className="mb-8">
            <div className="section-header">
              <h2 className="section-title text-green-600 dark:text-green-400">
                <Users size={28} />
                🌳 Árbol Organizacional Principal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Jerarquía con asignaciones correctas
              </p>
            </div>
            <div className="org-chart-container" ref={mainTreeRef}>
              <div className="org-chart-inner-wrapper">
                <div className="org-chart-tree">
                  <ul>
                    {organizationTree.mainTree.map((node) => (
                      <OrgNode
                        key={node.node_id}
                        node={node}
                        searchTerm={searchTerm}
                        showFederalEntity={selectedFederalEntity === null}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {organizationTree.vacantNodes.length > 0 && (
          <div className="mb-8">
            <div className="section-header">
              <h2 className="section-title text-red-600 dark:text-red-400">
                <AlertCircle size={28} />
                🚫 Puestos Vacantes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Posiciones sin empleado asignado
              </p>
            </div>
            <div className="vacant-grid">
              {organizationTree.vacantNodes.map((node) => (
                <div key={node.node_id} className="vacant-card">
                  <AlertCircle
                    size={40}
                    className="mx-auto mb-2 text-red-500 dark:text-red-400"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {node.position_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Nivel {node.level}
                  </p>
                  <div className="mt-3 text-xs text-red-700 dark:text-red-300 font-medium">
                    VACANTE DISPONIBLE
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {organizationTree.unassignedTree.length > 0 && (
          <div className="mb-8">
            <div className="section-header">
              <h2 className="section-title text-orange-600 dark:text-orange-400">
                <UserX size={28} />
                ⚠️ Sin Asignar
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Empleados sin jefe directo asignado
              </p>
            </div>
            <div className="org-chart-container" ref={unassignedTreeRef}>
              <div className="org-chart-inner-wrapper">
                <div className="org-chart-tree">
                  <ul>
                    {organizationTree.unassignedTree.map((node) => (
                      <OrgNode
                        key={node.node_id}
                        node={node}
                        searchTerm={searchTerm}
                        showFederalEntity={selectedFederalEntity === null}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {organizationTree.inconsistentTree.length > 0 && (
          <div className="mb-8">
            <div className="section-header">
              <h2 className="section-title text-yellow-600 dark:text-yellow-400">
                <AlertTriangle size={28} />
                ⚠️ Inconsistencias de Datos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Empleados con asignaciones incorrectas
              </p>
            </div>
            <div className="org-chart-container" ref={inconsistentTreeRef}>
              <div className="org-chart-inner-wrapper">
                <div className="org-chart-tree">
                  <ul>
                    {organizationTree.inconsistentTree.map((node) => (
                      <OrgNode
                        key={node.node_id}
                        node={node}
                        searchTerm={searchTerm}
                        showFederalEntity={selectedFederalEntity === null}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
