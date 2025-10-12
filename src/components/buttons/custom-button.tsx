import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomButtonProps {
  text: string;
  clicked: boolean;
  itemClickedTextColor?: string;
  itemUnClickedTextColor?: string;
  itemClickedBackgroundColor?: string;
  itemUnClickedBackgroundColor?: string;
  itemBorderRadius?: number;
  itemBorderWidth?: number;
  itemBorderColor?: string;
  click: () => void;
  style?: object;
  className?: string;
  isLoading: boolean;
  disabled?: boolean;
  iconName?: string;
  iconColor?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  className,
  clicked,
  itemClickedTextColor,
  itemUnClickedTextColor,
  itemClickedBackgroundColor,
  itemUnClickedBackgroundColor,
  itemBorderRadius = 16,
  itemBorderWidth = 0,
  itemBorderColor = "",
  click,
  disabled,
  style,
  isLoading,
  iconName,
  iconColor,
}) => {
  const buttonStyles = {
    backgroundColor: clicked
      ? itemClickedBackgroundColor
      : itemUnClickedBackgroundColor,
    borderRadius: itemBorderRadius,
    borderWidth: clicked ? itemBorderWidth : 0,
    borderColor: clicked ? itemBorderColor : "transparent",
    opacity: disabled ? 0.5 : 1, // Set opacity based on disabled state
  };

  const textStyles = {
    color: clicked ? itemClickedTextColor : itemUnClickedTextColor,
  };

  return (
    <TouchableOpacity
      className={className}
      style={[styles.wrapper, buttonStyles, style]}
      onPress={click}
      disabled={disabled || isLoading}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.content}>
          {iconName && (
            <Ionicons
              name={iconName as any}
              size={24}
              color={iconColor}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, textStyles]}>{text}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 48,

    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
});

export default CustomButton;
