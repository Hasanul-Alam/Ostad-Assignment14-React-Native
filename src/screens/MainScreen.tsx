// src/screens/MainScreen.js
// EXPO GO COMPATIBLE VERSION

import React, { useRef, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import SwipeableCard from "../components/SwapableCard";

/** @typedef {{ reset: () => void }} SwipeableCardRef */

const MainScreen = () => {
    /** @type {React.RefObject<SwipeableCardRef>} */
    const cardRef = useRef(null);
    const [isDismissed, setIsDismissed] = useState(false);

    // Button animation
    const buttonScale = useRef(new Animated.Value(1)).current;

    const handleDismiss = useCallback(() => {
        setIsDismissed(true);
    }, []);

    const handleReset = useCallback(() => {
        // Animate button press
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(buttonScale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();

        // Reset card
        if (cardRef.current) {
            // @ts-ignore
            cardRef.current.reset();
        }
        setIsDismissed(false);
    }, [buttonScale]);

    return (
        <View className="flex-1 bg-gray-900">
            {/* Background Gradient Effect */}
            <View className="absolute inset-0">
                <View className="absolute top-0 left-0 w-72 h-72 bg-indigo-500 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2" />
                <View className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full opacity-20 translate-x-1/2 translate-y-1/2" />
            </View>

            {/* Header */}
            <View className="pt-16 px-6">
                <Text className="text-white text-3xl font-bold text-center">
                    Gesture Demo
                </Text>
                <Text className="text-gray-400 text-center mt-2">
                    React Native Animated API
                </Text>
            </View>

            {/* Card Container */}
            <View className="flex-1 items-center justify-center">
                <SwipeableCard ref={cardRef} onDismiss={handleDismiss} />

                {/* Dismissed Message */}
                {isDismissed && (
                    <View className="absolute items-center">
                        <Text className="text-white text-xl font-semibold mb-2">
                            Card Dismissed! 🎉
                        </Text>
                        <Text className="text-gray-400 text-sm">
                            Press reset to bring it back
                        </Text>
                    </View>
                )}
            </View>

            {/* Instructions */}
            <View className="px-6 mb-4">
                <View className="bg-gray-800 rounded-2xl p-4">
                    <Text className="text-gray-300 text-sm text-center">
                        • <Text className="text-indigo-400">Drag</Text> horizontally to swipe
                    </Text>
                    <Text className="text-gray-300 text-sm text-center mt-1">
                        • <Text className="text-purple-400">Rotate</Text> based on drag distance
                    </Text>
                    <Text className="text-gray-300 text-sm text-center mt-1">
                        • <Text className="text-pink-400">Fade</Text> as card moves away
                    </Text>
                </View>
            </View>

            {/* Reset Button */}
            <View className="px-6 pb-10">
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                        onPress={handleReset}
                        activeOpacity={0.9}
                        className="bg-indigo-600 py-4 rounded-2xl items-center"
                    >
                        <Text className="text-white text-lg font-semibold">Reset Card</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

export default MainScreen;