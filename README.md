# 💪 Workout & Diet Planner - Modern SPA

A high-fidelity, fully client-side single-page web application for comprehensive fitness tracking, nutrition logging, and recovery management. All data persists locally in your browser using localStorage.

## ✨ Features

### User Profiling & Dynamic Tracking
- **Profile Setup**: Age, Weight, Height, and Health Goals (Strength, Endurance, Hypertrophy, Cross-training)
- **Automatic Calculations**: BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure)
- **Dynamic Macro Targets**: Personalized protein, carb, and fat recommendations based on your goal

### Core Fitness Modules

#### 🏋️ Bodyweight Exercises
- Track exercises with reps, sets, and difficulty levels
- Organized by date with card-based UI
- Quick add, edit, and delete functionality

#### 🔧 Stationary Machines
- Log machine exercises with load, reps, and sets
- Duration tracking for complete workout logging
- Notes for exercise variations and modifications

#### 🏃 Cardio Workouts
- **Running**: Distance, duration, pace calculation, heart rate zones
- **Cycling**: Distance, cadence, resistance levels
- Automatic speed and pace calculations
- Historical progress tracking

#### 🔀 Cross-Training
- Combine multiple workout types
- Track total session duration
- Flexible exercise combinations

### 📊 Diet & Nutrition Module
- **Daily Macro Tracker**: Real-time calorie and macro tracking
- **Meal Logging**: Breakfast, lunch, dinner, and snacks
- **Nutritional Breakdown**: Protein, carbs, and fat per meal
- **Progress Visualization**: Daily totals vs. personalized targets
- **Safety Features**: Deficit warnings for underage users

### ⏱️ Rest & Recovery Timer
- **Interactive Timer**: Stopwatch and countdown functionality
- **Workout-Specific Presets**:
  - Hypertrophy: 60-90 seconds
  - Strength: 3-5 minutes
  - Cardio Recovery: 5-10 minutes
  - Full Rest Day: Customizable
- **Audio Notifications**: Alerts when rest period completes
- **Persistent Tracking**: Session history saved locally

### 🛡️ Safety Guardrails (Under-18 Logic)
When a user logs an age under 18:
- **Persistent Warning Banner**: Clear visual indicators for youth fitness guidelines
- **Volume Restrictions**: Alerts for excessive heavy exercise sets (>4-5 per muscle group)
- **Rest Period Enforcement**: Minimum 2-3 minute rest between heavy sets
- **Caloric Deficit Warnings**: Flags deficits exceeding 500 calories
- **Growth Safety Advisories**: Guidance against dangerous practices for young athletes

### 🎨 Modern UI/UX
- **Dark/Light Mode Toggle**: Theme preference persisted in localStorage
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Lucide Icons**: Clean, consistent iconography
- **Smooth Animations**: Fade-in and slide-down transitions

## 🚀 Technology Stack

- **Vite** - Fast build tool and dev server
- **React 18+** - UI framework with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Lucide React** - Icon library
- **localStorage** - Client-side persistent storage
- **date-fns** - Date manipulation utilities

## 💾 Data Persistence

All data is stored in browser localStorage:
- `wp_user_profile` - User profile data
- `wp_bodyweight_exercises` - Bodyweight exercise logs
- `wp_machine_exercises` - Machine exercise logs
- `wp_cardio_sessions` - Cardio workout sessions
- `wp_cross_training` - Cross-training sessions
- `wp_meals` - Daily meal entries
- `wp_theme` - Theme preference

**No external server or database required** - everything stays on your device.

## 🔧 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## ✅ Key Features Verified

- ✅ Type-safe TypeScript development
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/light mode toggle with persistence
- ✅ Complete fitness tracking modules
- ✅ Comprehensive diet/nutrition logging
- ✅ Interactive recovery timer
- ✅ Under-18 safety guardrails
- ✅ localStorage persistence across sessions
- ✅ Zero external API dependencies
- ✅ Production-optimized build

## 🔐 Security & Privacy

- No external API calls
- No user tracking or analytics
- No server storage - fully client-side
- HTTPS-ready for GitHub Pages deployment

---

**Built for comprehensive fitness tracking and personal wellness management.**
