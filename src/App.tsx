import React from 'react';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { barbell, scale, person, restaurant, barChart } from 'ionicons/icons';
import { Navigate, Route } from 'react-router-dom';

import WorkoutsPage from './pages/WorkoutsPage';
import NutritionPage from './pages/NutritionPage';
import WeightPage from './pages/WeightPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingModal } from './components/OnboardingModal';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './theme/fittrack-theme.css';

setupIonicReact();

const MainApp: React.FC = () => {
  const { hasProfile } = useApp();

  return (
    <>
      {/* Requirement 0: Check on app startup if local DB profile exists. If not, trigger onboarding. */}
      <OnboardingModal isOpen={!hasProfile} />

      <IonTabs>
        <IonRouterOutlet>
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/weight" element={<WeightPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<Navigate to="/workouts" replace />} />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="workouts" href="/workouts">
            <IonIcon aria-hidden="true" icon={barbell} />
            <IonLabel>Ejercicios</IonLabel>
          </IonTabButton>

          <IonTabButton tab="nutrition" href="/nutrition">
            <IonIcon aria-hidden="true" icon={restaurant} />
            <IonLabel>Calorías</IonLabel>
          </IonTabButton>

          <IonTabButton tab="weight" href="/weight">
            <IonIcon aria-hidden="true" icon={scale} />
            <IonLabel>Peso & IMC</IonLabel>
          </IonTabButton>

          <IonTabButton tab="reports" href="/reports">
            <IonIcon aria-hidden="true" icon={barChart} />
            <IonLabel>Informe</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile">
            <IonIcon aria-hidden="true" icon={person} />
            <IonLabel>Perfil</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AppProvider>
      <IonReactHashRouter>
        <MainApp />
      </IonReactHashRouter>
    </AppProvider>
  </IonApp>
);

export default App;
