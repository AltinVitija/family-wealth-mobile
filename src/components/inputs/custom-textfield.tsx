import EyeIcon from "assets/icons/EyeIcon";
import clsx from "clsx";
import React, { ReactNode, useRef, useState } from "react";
import {
  View,
  TextInput,
  Platform,
  TextInputProps,
  Text,
  TouchableOpacity,
} from "react-native";
// import EyeIcon from "../../assets/images/svg/EyeIcon";

interface CustomTextInputProps extends TextInputProps {
  children?: ReactNode;
  onChangeText: (text: string) => void;
  label?: string;
  value: string;
  secureTextEntry?: boolean;
  errorMessage?: string | null;
  questionId?: string;
  maxChars?: number;
  response?: string;
  currentLength: number;
  showCharacterCount?: boolean; // Add this prop
  borderRadius?: number; // New prop for customizable border radius
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  errorMessage,
  questionId,
  response,
  maxChars,
  currentLength,
  showCharacterCount, // Destructure the new prop
  borderRadius = 16, // Default value

  ...rest
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const setInputCurrentValue = (text: string) => {
    setCurrentValue(text);
    onChangeText(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View className="relative mb-6">
      <View
        className={clsx("border rounded-md bg-white", {
          "border-charcoal": isFocused,
          "border-white": !isFocused,
          "border-rose-500": errorMessage,
        })}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: borderRadius, // Use the borderRadius prop
          paddingHorizontal: 10,
          ...Platform.select({
            ios: {
              shadowColor: "#0000000D",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.13,
              shadowRadius: 32,
            },
          }),
        }}>
        <TextInput
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={currentValue}
          onChangeText={setInputCurrentValue}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          className={clsx(
            "h-16 text-inter-regular text-sm pl-3 justify-center pb-3  items-center pt-6 flex-1 ",
            { "text-red-500": !!errorMessage }
          )}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={{
              width: "100%",
              height: 50,
              marginHorizontal: 5,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={togglePasswordVisibility}>
            <EyeIcon
              style={{ marginRight: 10 }}
              fill={{
                color:
                  isFocused || currentValue.length > 0 ? "black" : "#8E8E8E",
              }}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text
        onPress={focusInput}
        className={clsx(
          "absolute text-inter-regular  text-gray pl-6 transition duration-5000 ease-in-out",
          {
            "top-[10%] text-ltl text-redd": !!errorMessage,
            "top-[10%] text-ltl text-black":
              !errorMessage && (isFocused || currentValue.length > 0),
            "top-[30%] text-base mb-10":
              !errorMessage && !isFocused && currentValue.length === 0,
          }
        )}>
        {errorMessage ? errorMessage : label}
      </Text>
      {showCharacterCount && (
        <View>
          <Text className="font-inter-medium text-gray text-[13px]">
            Characters {currentLength}/{maxChars || 300}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CustomTextInput;
