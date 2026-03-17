import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  CompetenciasFormData,
  RegistroItem,
  SeccionClave,
  crearRegistroVacio,
  guardarCompetenciasForm,
  obtenerCompetenciasForm,
} from '@/app/services/competenciasService';

type SeccionConfig = {
  key: SeccionClave;
  titulo: string;
  subtitulo: string;
};

const TOTAL_STEPS = 9;
const INITIAL_STEP = 3;

const SECCIONES: SeccionConfig[] = [
  {
    key: 'competencia',
    titulo: '3.1 Competencia',
    subtitulo: 'Competencia',
  },
  {
    key: 'componentes',
    titulo: '3.2 Componentes',
    subtitulo: 'Componentes',
  },
  {
    key: 'contenidosActitudinales',
    titulo: '3.3 Contenidos actitudinales',
    subtitulo: 'Contenidos actitudinales',
  },
];

const EMPTY_STATE: CompetenciasFormData = {
  competencia: [],
  componentes: [],
  contenidosActitudinales: [],
};

export default function CompetenciasScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  const [currentStep, setCurrentStep] = useState(INITIAL_STEP);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState<CompetenciasFormData>(EMPTY_STATE);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    cargarVista();
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => setSuccessMessage(null), 2600);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const totalRegistros = useMemo(
    () =>
      form.competencia.length +
      form.componentes.length +
      form.contenidosActitudinales.length,
    [form]
  );

  async function cargarVista() {
    try {
      setLoading(true);
      const data = await obtenerCompetenciasForm();
      setForm(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los registros existentes.');
    } finally {
      setLoading(false);
    }
  }

  async function guardarCambios(
    payload: CompetenciasFormData = form,
    mensaje = 'Cambios guardados correctamente.'
  ) {
    try {
      setSaving(true);
      const response = await guardarCompetenciasForm(payload);
      setForm(response);
      setDirty(false);
      setSuccessMessage(mensaje);
      return true;
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  function actualizarTexto(seccion: SeccionClave, id: string, texto: string) {
    setForm((prev) => ({
      ...prev,
      [seccion]: prev[seccion].map((item) =>
        item.id === id ? { ...item, texto } : item
      ),
    }));
    setDirty(true);
  }

  function agregarCampo(seccion: SeccionClave) {
    setForm((prev) => ({
      ...prev,
      [seccion]: [...prev[seccion], crearRegistroVacio()],
    }));
    setDirty(true);
    setSuccessMessage('Nuevo campo habilitado correctamente.');
  }

  function eliminarRegistro(seccion: SeccionClave, item: RegistroItem) {
    const ejecutarEliminacion = async () => {
      const nextState: CompetenciasFormData = {
        ...form,
        [seccion]: form[seccion].filter((registro) => registro.id !== item.id),
      };

      setForm(nextState);
      setDirty(true);
      setSuccessMessage('Registro eliminado correctamente.');
      await guardarCambios(nextState, 'Registro eliminado y cambios guardados correctamente.');
    };

    if (Platform.OS === 'web') {
      const confirmado = typeof window !== 'undefined' ? window.confirm('¿Deseas eliminar este registro?') : false;
      if (confirmado) {
        void ejecutarEliminacion();
      }
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      '¿Deseas eliminar este registro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void ejecutarEliminacion();
          },
        },
      ]
    );
  }

  async function navegarAStep(step: number) {
    if (step === currentStep) return;

    if (dirty) {
      const ok = await guardarCambios(form, 'Cambios guardados antes de cambiar de sección.');
      if (!ok) return;
    }

    setCurrentStep(step);
    Alert.alert(
      'Navegación de ejemplo',
      `Aquí puedes redirigir a la sección ${step}.\n\nReemplaza esta alerta por router.push('/ruta-de-la-seccion-${step}') o tu navegación real.`
    );
  }

  async function handleSiguiente() {
    const ok = await guardarCambios(form, 'Cambios guardados correctamente.');
    if (!ok) return;

    const nextStep = Math.min(currentStep + 1, TOTAL_STEPS);
    setCurrentStep(nextStep);
    Alert.alert(
      'Paso siguiente',
      `Los datos se guardaron correctamente. Aquí puedes navegar a la sección ${nextStep}.`
    );
  }

  async function handleVolver() {
    const previousStep = Math.max(currentStep - 1, 1);

    if (dirty) {
      const ok = await guardarCambios(form, 'Cambios guardados antes de volver.');
      if (!ok) return;
    }

    setCurrentStep(previousStep);
    Alert.alert(
      'Paso anterior',
      `Aquí puedes navegar a la sección ${previousStep}.`
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isDesktop && (
          <View style={styles.sidebar}>
            <View style={styles.logoBox}>
              <Text style={styles.logoTitle}>USMP</Text>
              <Text style={styles.logoSubtitle}>Universidad de San Martín de Porres</Text>
            </View>

            <View style={styles.menuGroup}>
              <SidebarItem icon="home" label="Inicio" active />
              <SidebarItem icon="assignment" label="Asignaciones" />
            </View>
          </View>
        )}

        <View style={styles.contentArea}>
          <View style={styles.topBar}>
            <View />
            <View style={styles.userBadge}>
              <MaterialIcons name="person" size={18} color="#111827" />
              <Text style={styles.userText}>Norma León</Text>
              <MaterialIcons name="keyboard-arrow-down" size={18} color="#111827" />
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>
              3. COMPETENCIAS Y SUS COMPONENTES{`\n`}COMPRENDIDOS EN LA ASIGNATURA
            </Text>

            <View style={styles.stepsRow}>
              {Array.from({ length: TOTAL_STEPS }, (_, index) => {
                const step = index + 1;
                const isActive = step === currentStep;
                return (
                  <React.Fragment key={step}>
                    <Pressable
                      style={[styles.stepCircle, isActive && styles.stepCircleActive]}
                      onPress={() => navegarAStep(step)}>
                      <Text style={[styles.stepText, isActive && styles.stepTextActive]}>{step}</Text>
                    </Pressable>
                    {step < TOTAL_STEPS && <View style={styles.stepLine} />}
                  </React.Fragment>
                );
              })}
            </View>

            {successMessage && (
              <View style={styles.successBanner}>
                <MaterialIcons name="check-circle" size={18} color="#166534" />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>Registros cargados: {totalRegistros}</Text>
              <Text style={styles.summaryText}>{saving ? 'Guardando cambios...' : loading ? 'Cargando información...' : dirty ? 'Hay cambios pendientes' : 'Información sincronizada'}</Text>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <Text style={styles.loadingText}>Cargando registros existentes...</Text>
              </View>
            ) : (
              SECCIONES.map((seccion) => (
                <SectionCard
                  key={seccion.key}
                  title={seccion.titulo}
                  subtitle={seccion.subtitulo}
                  items={form[seccion.key]}
                  onChangeText={(id, texto) => actualizarTexto(seccion.key, id, texto)}
                  onAdd={() => agregarCampo(seccion.key)}
                  onDelete={(item) => eliminarRegistro(seccion.key, item)}
                />
              ))
            )}

            <View style={styles.footerButtons}>
              <Pressable style={styles.secondaryButton} onPress={handleVolver}>
                <Text style={styles.secondaryButtonText}>{'< Volver'}</Text>
              </Pressable>

              <Pressable style={styles.primaryButton} onPress={handleSiguiente}>
                <Text style={styles.primaryButtonText}>Siguiente {'>'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

type SectionCardProps = {
  title: string;
  subtitle: string;
  items: RegistroItem[];
  onChangeText: (id: string, texto: string) => void;
  onAdd: () => void;
  onDelete: (item: RegistroItem) => void;
};

function SectionCard({
  title,
  subtitle,
  items,
  onChangeText,
  onAdd,
  onDelete,
}: SectionCardProps) {
  return (
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>

        {items.map((item) => (
          <View key={item.id} style={styles.rowItem}>
            <TextInput
              value={item.texto}
              onChangeText={(texto) => onChangeText(item.id, texto)}
              placeholder={`Ingrese ${subtitle.toLowerCase()}`}
              style={styles.input}
              placeholderTextColor="#6b7280"
              multiline
            />

            <Pressable style={styles.removeButton} onPress={() => onDelete(item)}>
              <MaterialIcons name="close" size={18} color="#6b7280" />
            </Pressable>
          </View>
        ))}

        <View style={styles.addButtonRow}>
          <Pressable style={styles.addButton} onPress={onAdd}>
            <MaterialIcons name="add-circle-outline" size={22} color="#374151" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

type SidebarItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active?: boolean;
};

function SidebarItem({ icon, label, active = false }: SidebarItemProps) {
  return (
    <Pressable style={[styles.sidebarItem, active && styles.sidebarItemActive]}>
      <MaterialIcons name={icon} size={20} color={active ? '#ffffff' : '#d1d5db'} />
      <Text style={[styles.sidebarItemText, active && styles.sidebarItemTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
  },
  sidebar: {
    width: 220,
    backgroundColor: '#071c33',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
  },
  logoBox: {
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logoTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1,
  },
  logoSubtitle: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 4,
  },
  menuGroup: {
    marginTop: 24,
    gap: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sidebarItemText: {
    color: '#d1d5db',
    fontSize: 15,
    fontWeight: '500',
  },
  sidebarItemTextActive: {
    color: '#ffffff',
  },
  contentArea: {
    flex: 1,
  },
  topBar: {
    height: 74,
    backgroundColor: '#e10600',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    flexDirection: 'row',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  userText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 36,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#9ca3af',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#e10600',
    borderColor: '#e10600',
  },
  stepText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  stepTextActive: {
    color: '#ffffff',
  },
  stepLine: {
    width: 34,
    height: 2,
    backgroundColor: '#9ca3af',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  summaryText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  loadingBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadingText: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '600',
  },
  sectionWrapper: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ececec',
    padding: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 10,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#111827',
    fontSize: 14,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonRow: {
    alignItems: 'flex-end',
    marginTop: 2,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtons: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#111111',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#e10600',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
