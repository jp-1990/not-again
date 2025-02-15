import React, { PropsWithChildren } from "react";
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

export default React.forwardRef(function Button(
  {
    onPress,
    onPressIn,
    onPressOut,
    buttonStyle,
    rippleStyle,
    children,
  }: {
    onPress?: (e?: GestureResponderEvent) => void;
    onPressIn?: (e?: GestureResponderEvent) => void;
    onPressOut?: (e?: GestureResponderEvent) => void;
    buttonStyle?: Record<string, any> | Record<string, any>[];
    rippleStyle?: Record<string, any> | Record<string, any>[];
  } & PropsWithChildren,
  _ref,
) {
  const rippleScale = useSharedValue(1);
  const [rippleVisible, setRippleVisible] = React.useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleVisible ? 0.3 : 0,
  }));

  function handlePressIn() {
    setRippleVisible(true);
    rippleScale.value = withTiming(1.5, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    onPressIn && onPressIn();
  }

  function handlePressOut() {
    rippleScale.value = withTiming(
      1,
      { duration: 300, easing: Easing.in(Easing.ease) },
      () => runOnJS(setRippleVisible)(false),
    );
    onPressOut && onPressOut();
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{
        color: "rgba(255,255,255,0.3)",
        borderless: false,
      }}
      style={[
        styles.button,
        ...(Array.isArray(buttonStyle) ? buttonStyle : [buttonStyle]),
      ]}
    >
      <View style={styles.childContainer}>
        {Platform.OS === "ios" && (
          <Animated.View
            style={[
              styles.ripple,
              ...(Array.isArray(rippleStyle) ? rippleStyle : [rippleStyle]),
              animatedStyle,
            ]}
          />
        )}
        {children}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    width: 96,
    height: 48,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  ripple: {
    position: "absolute",
    width: 96,
    height: 48,
    backgroundColor: "white",
    borderRadius: 50,
  },
  childContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
