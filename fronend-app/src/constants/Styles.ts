import { StyleSheet, Platform } from 'react-native';
import { Colors } from './Colors';
export { Colors };

export const GlobalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    shadowSm: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    shadowMd: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
    },
    heading1: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text,
        letterSpacing: -0.5,
    },
    heading2: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        letterSpacing: -0.3,
    },
    heading3: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
    },
    body: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    caption: {
        fontSize: 14,
        color: Colors.textLight,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
