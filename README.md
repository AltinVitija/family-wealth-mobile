# Family Wealth Management - Mobile Application

## 📱 Rreth Aplikacionit

Aplikacion mobil për menaxhimin e pasurisë familjare, i zhvilluar si pjesë e temës së diplomës bachelor. Aplikacioni ofron një platformë të unifikuar për:

- Dashboard me metrika në kohë reale të pasurisë familjare
- Menaxhim të planeve të trashëgimisë (Estate Plans) me asete dhe përfitues
- Regjistër të anëtarëve të familjes
- Ndjekje të objektivave financiare me progres dhe afate
- Sistem detyarash për koordinim efektiv

## 🛠 Teknologjitë

- **Framework**: React Native (Expo SDK 54)
- **Gjuha**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 7.x
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Platform Support**: iOS & Android

## 📋 Parakushtet

- Node.js v18 ose më i ri
- npm ose yarn
- Expo CLI: `npm install -g @expo/cli`
- Për iOS: macOS me Xcode
- Për Android: Android Studio dhe Android SDK

### Për Testim:

- **Expo Go app** (iOS/Android) - e rekomandueshme për development
- Ose emulator (iOS Simulator / Android Emulator)

## 🚀 Instalimi

### 1. Clone Repository dhe Instalo Dependencies

```bash
cd family-wealth-mobile
npm install
```

### 2. Konfigurimi i API Endpoint

Edito `src/services/api.ts` dhe vendos URL-në e backend API:

```typescript
// Development
const API_URL = 'http://localhost:8080/api/v1';

// Android Emulator
const API_URL = 'http://10.0.2.2:8080/api/v1';

// iOS Simulator (macOS local network)
const API_URL = 'http://192.168.1.X:8080/api/v1'; // Vendos IP-në tënde lokale

// Production
const API_URL = 'https://your-backend-domain.com/api/v1';
```

**💡 Shënim**: Përdor `ipconfig` (Windows) ose `ifconfig` (macOS/Linux) për të gjetur IP-në lokale.

## 🎯 Ekzekutimi

### Development Mode (Expo Go)

```bash
# Start Expo development server
npm start

# Ose për platform specifik:
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

Pas startimit:

1. Scano QR code me **Expo Go app** në telefon
2. Ose shtyp `i` për iOS Simulator
3. Ose shtyp `a` për Android Emulator

### Production Build

#### iOS (macOS only)

```bash
# Prebuild native iOS project
npm run prebuild

# Build për iOS
eas build --platform ios

# Ose lokalisht (kërkon Xcode)
npx expo run:ios --configuration Release
```

#### Android

```bash
# Prebuild native Android project
npm run prebuild

# Build për Android
eas build --platform android

# Ose lokalisht
npx expo run:android --variant release
```

## 📂 Struktura e Projektit

```
family-wealth-mobile/
├── src/
│   ├── assets/
│   │   └── icons/              # Custom icons
│   ├── components/
│   │   ├── buttons/
│   │   │   └── custom-button.tsx
│   │   ├── inputs/
│   │   │   └── custom-textfield.tsx
│   │   └── modals/
│   │       └── AddEstatePlaneModal.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx    # Main app navigator
│   │   ├── AuthNavigator.tsx   # Auth screens (Login, Register)
│   │   └── MainNavigator.tsx   # Bottom tabs (Dashboard, Estate, Family, Goals)
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── estate/
│   │   │   └── EstateScreen.tsx
│   │   ├── family/
│   │   └── goals/
│   ├── services/
│   │   ├── api.ts              # Axios instance
│   │   ├── axiosInterceptor.ts # JWT interceptor
│   │   ├── auth/               # Auth services
│   │   ├── dashboard/
│   │   ├── estate/
│   │   ├── familyMember/
│   │   ├── financialGoal/
│   │   └── storage/
│   │       └── asyncStorage.ts
│   ├── store/
│   │   ├── index.ts            # Redux store configuration
│   │   └── slices/
│   │       ├── auth/
│   │       │   └── authSlice.ts
│   │       ├── dashboard/
│   │       ├── estatePlan/
│   │       ├── familyMembers/
│   │       └── financialGoals/
│   ├── types/
│   │   ├── navigation.ts       # Navigation types
│   │   ├── user.ts
│   │   ├── estatePlan.ts
│   │   ├── familyMember.ts
│   │   ├── goals.ts
│   │   └── dashboard.ts
│   └── utils/
│       └── constants.tsx
├── App.tsx
├── app.json                    # Expo configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🎨 Karakteristikat Kryesore

### 1. Dashboard

- **Metrika në Kohë Reale**
  - Vlera totale e pasurisë aktive
  - Numri i planeve të trashëgimisë
  - Numri i anëtarëve të familjes
  - Objektiva aktive dhe detyra në pritje
- **Pull-to-Refresh** për përditësim instant të të dhënave
- **Welcome Message** me emrin e përdoruesit

### 2. Estate Plans (Planet e Trashëgimisë)

- Lista e të gjitha planeve me status (draft/active/archived)
- Detaje plani:
  - Lista e aseteve me vlerat përkatëse
  - Përfituesit me përqindje shpërndarjeje
  - **Validim automatik**: Shuma e përqindjeve duhet të jetë 100%
- CRUD operations (Create, Read, Update, Delete)

### 3. Family Members (Anëtarët e Familjes)

- Regjistër i plotë i anëtarëve me:
  - Emër, mbiemër
  - Marrëdhënia (spouse, child, parent, sibling, other)
  - Kontakte (email, telefon)
  - Datëlindje
- Avatar support
- Kërkim dhe filtrim

### 4. Financial Goals (Objektivat Financiare)

- Vendosje e objektivave me:
  - Titull dhe kategori (education, retirement, investment, savings, other)
  - Shumë target dhe shumë e arritur
  - Data e synuar
- **Progress Tracking**:
  - Përqindje progresi (%)
  - Ditë të mbetura
  - Shumë e mbetur për të arritur target-in
- Caktimi i anëtarëve përgjegjës

## 🔐 Autentifikimi

### Flow i Autentifikimit:

1. **Register** → Email, Password, Emër, Mbiemër, Telefon
2. **Login** → Email, Password → JWT Token
3. **Token Storage** → AsyncStorage (local persistence)
4. **Auto-Login** → Nëse token ekziston dhe është valid
5. **Token Refresh** → Axios interceptor rifreskon token automatikisht
6. **Logout** → Fshirja e token nga AsyncStorage

### Siguritë:

- Password hashing në backend (bcrypt)
- JWT token me expiration
- Axios interceptor shton automatikisht `Authorization: Bearer <token>`
- Token validation në çdo request

## 📱 Navigimi

Aplikacioni përdor React Navigation me dy stacks kryesore:

### Auth Stack (pa autentifikim)

- LoginScreen
- RegisterScreen
- ForgotPasswordScreen

### Main Stack (me autentifikim)

- **Bottom Tabs**:
  - 🏠 Dashboard
  - 📄 Estate Plans
  - 👨‍👩‍👧‍👦 Family Members
  - 🎯 Financial Goals

## 🎯 State Management (Redux Toolkit)

Redux Toolkit përdoret për menaxhimin e state-it global:

### Slices:

- **authSlice** - User authentication, token, user info
- **dashboardSlice** - Dashboard metrics
- **estatePlanSlice** - Estate plans, assets, beneficiaries
- **familyMembersSlice** - Family members
- **financialGoalsSlice** - Financial goals

### Async Operations:

Të gjitha thirrjet API përdorin Redux Toolkit's `createAsyncThunk`:

```typescript
// Example: Fetch dashboard data
export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDashboardData();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

## 🧪 Testimi

### Unit Tests

```bash
npm test
```

### E2E Tests (Detox - optional)

```bash
npm run test:e2e
```

## 🐛 Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache
npx expo start --clear

# Reset project
rm -rf node_modules
npm install
npx expo start --clear
```

### Network Request Failed

**Problemi:** API calls dështojnë me "Network request failed"

**Zgjidhje:**

1. Verifiko që backend është duke u ekzekutuar: `http://localhost:8080/health`
2. Nëse po përdor Android Emulator, përdor `http://10.0.2.2:8080` në vend të `localhost`
3. Nëse po përdor telefon fizik, sigurohu që telefoni dhe laptop janë në të njëjtin WiFi

### AsyncStorage Persistence Issues

```typescript
// Clear AsyncStorage (for testing)
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.clear().then(() => {
  console.log('Storage cleared');
});
```

### iOS Pod Install Failed

```bash
cd ios
pod install
cd ..
npm run ios
```

## 📝 Linting dhe Formatting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run format
```

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: add beneficiary validation UI"

# Push to remote
git push origin feature/your-feature-name
```

## 📚 Dokumentime Shtesë

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)

## 🤝 Kontributi

Ky projekt është pjesë e temës së diplomës bachelor dhe nuk pranon kontribute të jashtme në këtë fazë.

## 📄 Licensa

ISC License

## 👨‍💻 Autori

**Altin Vitija**  
Fakulteti Riinvest  
Departamenti i Shkencave Kompjuterike  
Shtator 2025

---

**Mentor:** MSc. Albnora Hoti Krasniqi

## 🙏 Falënderime

- Fakulteti Riinvest
- MSc. Albnora Hoti Krasniqi (Mentor)
- Familja për mbështetje të vazhdueshme
- Komuniteti Open Source (React Native, Expo, Redux)
