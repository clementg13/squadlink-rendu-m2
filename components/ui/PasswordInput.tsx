import React, { useState, forwardRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface PasswordInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  ({ containerStyle, inputStyle, ...props }, ref) => {
    const [isSecure, setIsSecure] = useState(true);

    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref}
          style={[styles.input, inputStyle]}
          secureTextEntry={isSecure}
          {...props}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setIsSecure(!isSecure)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={isSecure ? "Afficher le mot de passe" : "Masquer le mot de passe"}
        >
          <FontAwesome
            name={isSecure ? "eye" : "eye-slash"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingRight: 50, // Laisser de la place pour l'icône
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PasswordInput;
