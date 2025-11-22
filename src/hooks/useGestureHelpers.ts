/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDecay,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

/**
 * Custom hook for Reanimated v2 gesture helpers
 * Handles shared values, interpolations, and animated styles
 */
export const useGestureHelpers = (onDismissCallback: any) => {
  // Reanimated shared values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const isCardDismissed = useSharedValue(false);

  // Reset shared values with spring animation
  const resetSharedValues = useCallback(() => {
    "worklet";
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    cardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    isCardDismissed.value = false;
  }, []);

  // Handle gesture end logic
  const handleGestureEnd = useCallback(
    (translationX: any, velocityX: any) => {
      "worklet";
      const shouldDismiss = Math.abs(translationX) > SWIPE_THRESHOLD;

      if (shouldDismiss) {
        // Dismiss card off-screen using withDecay or withTiming
        const direction = translationX > 0 ? 1 : -1;
        const targetX = direction * SCREEN_WIDTH * 1.5;

        if (Math.abs(velocityX) > 500) {
          // Use decay for high velocity swipes
          translateX.value = withDecay({
            velocity: velocityX,
            clamp: [
              direction > 0 ? 0 : -SCREEN_WIDTH * 2,
              direction > 0 ? SCREEN_WIDTH * 2 : 0,
            ],
          });
        } else {
          // Use timing for slower swipes
          translateX.value = withTiming(targetX, { duration: 300 });
        }

        isCardDismissed.value = true;

        if (onDismissCallback) {
          runOnJS(onDismissCallback)();
        }
      } else {
        // Spring back to center
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
          velocity: velocityX,
        });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    },
    [onDismissCallback]
  );

  // Animated style with interpolations for rotation and opacity
  const cardAnimatedStyle = useAnimatedStyle(() => {
    // Interpolate rotation based on translateX (-15° to 15°)
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );

    // Interpolate opacity (farther = lower opacity)
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH / 2],
      [1, 0.5],
      Extrapolation.CLAMP
    );

    // Optional scale effect during drag
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH / 2],
      [1, 0.95],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale * cardScale.value },
      ],
      opacity,
    };
  });

  return {
    translateX,
    translateY,
    cardScale,
    isCardDismissed,
    resetSharedValues,
    handleGestureEnd,
    cardAnimatedStyle,
    SWIPE_THRESHOLD,
  };
};
