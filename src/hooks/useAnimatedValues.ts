import { useRef, useCallback } from "react";
import { Animated } from "react-native";

/**
 * Custom hook for Classic Animated API values
 * Handles opacity, scale animations using Animated.Value, timing, and decay
 */
export const useAnimatedValues = () => {
  // Classic Animated.Values for opacity and scale
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const classicTranslateX = useRef(new Animated.Value(0)).current;

  // Entry animation - fade and scale in on mount
  const animateEntry = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Dismiss animation using Animated.timing for fade out
  const animateDismiss = useCallback(
    (onComplete: any) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(onComplete);
    },
    [fadeAnim]
  );

  // Decay animation for classic translateX
  const animateDecay = useCallback(
    (velocity: any) => {
      Animated.decay(classicTranslateX, {
        velocity: velocity,
        deceleration: 0.997,
        useNativeDriver: true,
      }).start();
    },
    [classicTranslateX]
  );

  // Reset all classic animated values
  const resetAnimatedValues = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.5);
    classicTranslateX.setValue(0);
    animateEntry();
  }, [fadeAnim, scaleAnim, classicTranslateX, animateEntry]);

  // Animated.event for mapping gesture values (requirement 6)
  const panResponderEvent = Animated.event(
    [{ nativeEvent: { translationX: classicTranslateX } }],
    { useNativeDriver: true }
  );

  return {
    fadeAnim,
    scaleAnim,
    classicTranslateX,
    animateEntry,
    animateDismiss,
    animateDecay,
    resetAnimatedValues,
    panResponderEvent,
  };
};
