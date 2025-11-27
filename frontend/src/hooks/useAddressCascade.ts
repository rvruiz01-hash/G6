// src/hooks/useAddressCascade.ts
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api";

interface FederalEntity {
  id: string;
  name: string;
}

interface Municipality {
  id: number;
  name: string;
  federal_entity_id: string;
}

interface Colony {
  id: number;
  name: string;
  postal_code: string;
  municipality_id: number;
}

interface UseAddressCascadeProps {
  onError: (message: string) => void;
}

export const useAddressCascade = ({ onError }: UseAddressCascadeProps) => {
  // Estados para almacenar los catálogos
  const [federalEntities, setFederalEntities] = useState<FederalEntity[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [colonies, setColonies] = useState<Colony[]>([]);

  // Estados de carga
  const [loadingCP, setLoadingCP] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingColonies, setLoadingColonies] = useState(false);

  // ✅ FIX: Usar ref para evitar que se incluya en las dependencias
  const onErrorRef = useRef(onError);

  // Actualizar ref cuando cambie onError
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  /**
   * Cargar entidades federativas (siempre disponibles)
   * ✅ FIX: No incluir onError en las dependencias
   */
  const loadFederalEntities = useCallback(async () => {
    try {
      const response = await api.get("/federal-entities");
      setFederalEntities(response.data);
    } catch (error) {
      console.error("Error al cargar entidades federativas:", error);
      onErrorRef.current("Error al cargar los estados");
    }
  }, []); // ✅ Array vacío - solo se ejecuta una vez

  /**
   * Cargar municipios por entidad federativa
   */
  const loadMunicipalitiesByState = useCallback(async (stateId: string) => {
    if (!stateId) {
      setMunicipalities([]);
      return;
    }

    setLoadingMunicipalities(true);
    try {
      const response = await api.get(`/municipalities/by-state/${stateId}`);
      setMunicipalities(response.data.municipalities || []);
    } catch (error) {
      console.error("Error al cargar municipios:", error);
      onErrorRef.current("Error al cargar los municipios");
      setMunicipalities([]);
    } finally {
      setLoadingMunicipalities(false);
    }
  }, []);

  /**
   * Cargar colonias por municipio
   */
  const loadColoniesByMunicipality = useCallback(
    async (municipalityId: number) => {
      if (!municipalityId) {
        setColonies([]);
        return;
      }

      setLoadingColonies(true);
      try {
        const response = await api.get(
          `/colonies/by-municipality/${municipalityId}`
        );
        setColonies(response.data.colonies || []);
      } catch (error) {
        console.error("Error al cargar colonias:", error);
        onErrorRef.current("Error al cargar las colonias");
        setColonies([]);
      } finally {
        setLoadingColonies(false);
      }
    },
    []
  );

  /**
   * Buscar por código postal y cargar todo automáticamente
   */
  const loadByPostalCode = useCallback(
    async (postalCode: string) => {
      if (!postalCode || postalCode.length !== 5) {
        return null;
      }

      setLoadingCP(true);
      try {
        const response = await api.get(
          `/colonies/by-postal-code/${postalCode}`
        );

        if (response.status === 404 || !response.data.colonies.length) {
          onErrorRef.current(
            "No se encontraron colonias para este código postal"
          );
          return null;
        }

        const { colonies, municipality, federal_entity } = response.data;

        // Cargar municipios del estado encontrado
        await loadMunicipalitiesByState(federal_entity.id);

        // Establecer las colonias encontradas
        setColonies(colonies);

        return {
          colonies,
          municipality,
          federalEntity: federal_entity,
        };
      } catch (error: any) {
        if (error.response?.status === 404) {
          onErrorRef.current("Código postal no encontrado");
        } else {
          console.error("Error al buscar código postal:", error);
          onErrorRef.current("Error al buscar el código postal");
        }
        return null;
      } finally {
        setLoadingCP(false);
      }
    },
    [loadMunicipalitiesByState]
  );

  /**
   * Obtener código postal de una colonia
   */
  const getPostalCodeFromColony = useCallback(async (colonyId: number) => {
    if (!colonyId) return null;

    try {
      const response = await api.get(`/colonies/${colonyId}/postal-code`);
      return response.data.postal_code;
    } catch (error) {
      console.error("Error al obtener código postal:", error);
      return null;
    }
  }, []);

  /**
   * Limpiar municipios y colonias
   */
  const resetMunicipalitiesAndColonies = useCallback(() => {
    setMunicipalities([]);
    setColonies([]);
  }, []);

  /**
   * Limpiar solo colonias
   */
  const resetColonies = useCallback(() => {
    setColonies([]);
  }, []);

  // ✅ Cargar entidades federativas al montar el componente
  // Solo se ejecuta UNA VEZ cuando el componente se monta
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await loadFederalEntities();
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [loadFederalEntities]); // ✅ loadFederalEntities es estable (no cambia)

  return {
    // Estados
    federalEntities,
    municipalities,
    colonies,

    // Estados de carga
    loadingCP,
    loadingMunicipalities,
    loadingColonies,

    // Funciones
    loadByPostalCode,
    loadMunicipalitiesByState,
    loadColoniesByMunicipality,
    getPostalCodeFromColony,
    resetMunicipalitiesAndColonies,
    resetColonies,
  };
};
