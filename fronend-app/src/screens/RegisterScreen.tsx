import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '../constants/Styles';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) return;
        setLoading(true);
        try {
            await register(name, email, password);
            navigation.navigate('MainTabs', { screen: 'Profile' });
        } catch (error) {
            // Error handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join ZED DREAM for exclusive access</Text>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <User size={20} color={Colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor={Colors.textLight}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor={Colors.textLight}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                placeholderTextColor={Colors.textLight}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOff size={20} color={Colors.textLight} />
                                ) : (
                                    <Eye size={20} color={Colors.textLight} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.registerLink}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    content: {
        padding: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textLight,
        marginBottom: 40,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    loginButton: {
        backgroundColor: Colors.primary,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 10,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: Colors.textLight,
        fontSize: 14,
    },
    registerLink: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});
