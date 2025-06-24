import React, { useState, useEffect } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";

const SplashScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Create an animated value for opacity

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000, // Fade in duration in milliseconds
      useNativeDriver: true, // Use native driver for smoother animation (optional)
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.heading}>MaTtaxPro</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Replace with your desired background color
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
  },
});

export default SplashScreen;
