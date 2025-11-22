/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { View, Text, Animated, PanResponder, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const SwipeableCard = forwardRef(function SwipeableCard({ onDismiss }: any, ref) {
    // Classic Animated Values
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    // Entry animation on mount
    useEffect(() => {
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
    }, []);

    // Reset function exposed to parent
    const reset = () => {
        translateX.setValue(0);
        translateY.setValue(0);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.5);

        Animated.parallel([
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
            }),
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
    };

    useImperativeHandle(ref, () => ({ reset }));

    // PanResponder for gesture handling
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            // Animated.event for mapping gesture values (Requirement 6)
            onPanResponderMove: Animated.event(
                [null, { dx: translateX, dy: translateY }],
                { useNativeDriver: false }
            ),

            onPanResponderRelease: (_, gestureState) => {
                const { dx, vx } = gestureState;

                if (Math.abs(dx) > SWIPE_THRESHOLD) {
                    // Dismiss card off-screen
                    const direction = dx > 0 ? 1 : -1;
                    const targetX = direction * SCREEN_WIDTH * 1.5;

                    if (Math.abs(vx) > 0.5) {
                        // Use decay for high velocity
                        Animated.decay(translateX, {
                            velocity: vx,
                            deceleration: 0.997,
                            useNativeDriver: true,
                        }).start();
                    } else {
                        // Use timing for slower swipes
                        Animated.timing(translateX, {
                            toValue: targetX,
                            duration: 300,
                            useNativeDriver: true,
                        }).start();
                    }

                    // Fade out
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        if (onDismiss) onDismiss();
                    });
                } else {
                    // Spring back to center
                    Animated.parallel([
                        Animated.spring(translateX, {
                            toValue: 0,
                            friction: 5,
                            tension: 40,
                            useNativeDriver: true,
                        }),
                        Animated.spring(translateY, {
                            toValue: 0,
                            friction: 5,
                            tension: 40,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }
            },
        })
    ).current;

    // Interpolations (Requirement 5)
    const rotate = translateX.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ["-15deg", "0deg", "15deg"],
        extrapolate: "clamp",
    });

    const opacity = translateX.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: [0.5, 1, 0.5],
        extrapolate: "clamp",
    });

    const scale = translateX.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: [0.95, 1, 0.95],
        extrapolate: "clamp",
    });

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={{
                transform: [
                    { translateX },
                    { translateY: Animated.multiply(translateY, 0.3) },
                    { rotate },
                    { scale: Animated.multiply(scale, scaleAnim) },
                ],
                opacity: Animated.multiply(opacity, fadeAnim),
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 10,
            }}
        >
            <View className="w-80 h-96 bg-white rounded-3xl overflow-hidden border border-gray-100">
                {/* Card Header */}
                <View className="bg-indigo-600 px-6 py-8">
                    <Text className="text-white text-2xl font-bold">Swipeable Card</Text>
                    <Text className="text-indigo-200 text-sm mt-2">Drag me left or right!</Text>
                </View>

                {/* Card Content */}
                <View className="flex-1 px-6 py-6">
                    <View className="flex-row items-center mb-4">
                        <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center">
                            <Text className="text-indigo-600 text-xl">👆</Text>
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-gray-800 font-semibold">Drag</Text>
                            <Text className="text-gray-500 text-sm">Move horizontally</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-4">
                        <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                            <Text className="text-purple-600 text-xl">🔄</Text>
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-gray-800 font-semibold">Rotate</Text>
                            <Text className="text-gray-500 text-sm">Tilts as you drag</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-pink-100 rounded-full items-center justify-center">
                            <Text className="text-pink-600 text-xl">✨</Text>
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-gray-800 font-semibold">Fade</Text>
                            <Text className="text-gray-500 text-sm">Opacity changes</Text>
                        </View>
                    </View>
                </View>

                {/* Card Footer */}
                <View className="px-6 py-4 border-t border-gray-100">
                    <Text className="text-gray-400 text-xs text-center">
                        Swipe far enough to dismiss
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
});

SwipeableCard.displayName = "SwipeableCard";

export default SwipeableCard;