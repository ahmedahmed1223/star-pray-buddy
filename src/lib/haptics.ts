import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export async function hapticLight() {
  if (isNative) {
    await Haptics.impact({ style: ImpactStyle.Light });
  } else if (navigator.vibrate) {
    navigator.vibrate(30);
  }
}

export async function hapticMedium() {
  if (isNative) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } else if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

export async function hapticHeavy() {
  if (isNative) {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } else if (navigator.vibrate) {
    navigator.vibrate(80);
  }
}

export async function hapticSuccess() {
  if (isNative) {
    await Haptics.notification({ type: NotificationType.Success });
  } else if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  }
}

export async function hapticWarning() {
  if (isNative) {
    await Haptics.notification({ type: NotificationType.Warning });
  } else if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50]);
  }
}
