# fitGo! - Aplicación de Ejercicio y Control de Peso

Aplicación móvil y web construida con **Ionic 9 + React 19 + TypeScript + Vite + Capacitor**, diseñada para la creación y ejecución de rutinas de entrenamiento y el control riguroso de peso e IMC (Índice de Masa Corporal).

---

## 🚀 Requerimientos Implementados

### 0. Verificación inicial de datos de usuario en la base de datos local
- Al iniciar la aplicación, se evalúa en el almacenamiento local (`localStorage` / persistencia) si el usuario ya registró su perfil (`name`, `birthDate`, `gender`, `height`, etc.).
- Si no existen los datos, se despliega automáticamente la pantalla modal de bienvenida / onboarding para capturar nombre, fecha de nacimiento, género, estatura (cm), peso inicial y peso objetivo.
- Dichos datos quedan almacenados localmente y son accesibles/editables en la pestaña **Perfil**, calculando automáticamente la edad en años.

### 1. Sección de Ejercicio y Creación de Rutinas
- Catálogo de ejercicios clasificados por grupo muscular (Pecho, Espalda, Piernas, Hombros, Brazos, Core, Cardio) con soporte para crear ejercicios personalizados.
- **Soporte para GIFs e Ilustraciones animadas** (integrado con la biblioteca abierta **[ExerciseGymGifsDB](https://github.com/JahelCuadrado/ExerciseGymGifsDB)** a través de CDN global de **jsDelivr**):
  - Más de 1,300 animaciones en bucle de ejercicios con soporte para español y sin restricciones de hotlink/CORS.
  - Al tocar la animación, se amplía a pantalla completa para examinar la técnica.
  - Al crear ejercicios personalizados, se puede especificar cualquier URL de animación/GIF (de GymVisual, ExerciseGymGifsDB, o web).
- En la creación de rutinas (`RoutineFormModal`), cada ejercicio permite seleccionar exactamente su tipo de medición:
  - **Peso + Repeticiones (`weight_reps`)**: Configuración de número de series, peso objetivo en kg y repeticiones.
  - **Duración del ejercicio (`duration`)**: Configuración de número de series y duración objetivo en segundos/minutos (ej. planchas, cardio).
  - **Solo repeticiones (`reps_only`)**: Configuración de número de series y repeticiones (ej. dominadas o flexiones con peso corporal).
- Configuración de tiempo de descanso entre series (en segundos).

### 2. Selección de Rutina para el Día y Marcado de Sets
- En la pestaña **Ejercicios**, se listan todas las rutinas con botón directo **"Entrenar Hoy"**.
- Al iniciar la sesión, se abre el reproductor interactivo de entrenamiento (`WorkoutPlayerModal`):
  - Cronómetro de sesión en curso.
  - Barra de progreso interactiva (series completadas vs totales).
  - Botón táctil para cada set para marcar si fue completado o pendiente (con cambio de estado visual y feedback).
  - Posibilidad de ajustar los kilos o repeticiones reales efectuadas en cada set al momento.
  - Temporizador de descanso automático con cuenta regresiva al completar cada set (+30s y botón saltar).
  - Botón para **Finalizar Entrenamiento**, registrando la sesión en el historial de actividad.

### 3. Control de Peso, Medidas Opcionales y Seguimiento de IMC
- En la pestaña **Peso & IMC**:
  - Formulario modal (`WeightFormModal`) para registrar fecha, peso (kg) y estatura (cm).
  - **Medidas corporales opcionales**:
    - Cintura (cm)
    - Cadera (cm)
    - Pecho (cm)
    - Brazo (cm)
    - Muslo (cm)
    - Porcentaje de grasa corporal (%)
    - Notas y observaciones.
  - Cálculo automático y en tiempo real del **IMC**:
    $$\text{IMC} = \frac{\text{peso (kg)}}{(\text{estatura en m})^2}$$
  - **Indicador y medidor visual de IMC** con categorías oficiales de la OMS (Bajo peso, Normal, Sobrepeso, Obesidad I, II y III) y recomendaciones de salud.
  - **Gráfica de evolución temporal** (SVG responsivo) que muestra la curva de peso a lo largo de las fechas y el diferencial total (+/- kg).
  - Historial detallado con opciones para editar o eliminar cualquier registro.

---

## 🛠️ Ejecución y Desarrollo

Entra a la carpeta del proyecto:
```bash
cd fittrack
```

Para iniciar el servidor de desarrollo en el navegador:
```bash
npm run dev
# o usando el CLI de ionic:
ionic serve
```

Para compilar para producción:
```bash
npm run build
```

Para ejecutar los tests unitarios:
```bash
npm run test:unit
```

