export default {
  expo: {
    name: "academiadeinmigrantesnuevav2",
    slug: "academiadeinmigrantesnuevav2",
    scheme: "exp+academiadeinmigrantesnuevav2",
    version: "1.0.0",
    splash: {
      image: "./assets/logo.jpg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    extra: {
      eas: {
        projectId: "9006b297-473e-421e-a067-ceaf96202da1"
      }
    },
    android: {
      package: "com.academiadeinmigrantes",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "RECORD_AUDIO",
        "CAMERA",
        "WRITE_EXTERNAL_STORAGE",
        "READ_EXTERNAL_STORAGE"
      ]
    },
    ios: {
      infoPlist: {
        NSMicrophoneUsageDescription: "Esta aplicación necesita acceso al micrófono para las funciones de reconocimiento de voz.",
        NSCameraUsageDescription: "Esta aplicación necesita acceso a la cámara para tomar fotos.",
        NSPhotoLibraryUsageDescription: "Esta aplicación necesita acceso a la galería de fotos."
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "buildToolsVersion": "35.0.0"
          }
        }
      ]
    ]
  }
};
