import { StyleSheet } from 'react-native';
import { Colors } from './Colors';
export { Colors };

// Spectral (serif) carries headings/display text; Manrope (sans) carries
// body/UI text. Loaded via @expo-google-fonts/* and gated behind
// SplashScreen in App.tsx.
export const Fonts = {
    serifRegular: 'Spectral_400Regular',
    serifMedium: 'Spectral_500Medium',
    serifSemiBold: 'Spectral_600SemiBold',
    serifBold: 'Spectral_700Bold',
    sansRegular: 'Manrope_400Regular',
    sansMedium: 'Manrope_500Medium',
    sansSemiBold: 'Manrope_600SemiBold',
    sansBold: 'Manrope_700Bold',
    sansExtraBold: 'Manrope_800ExtraBold',
};

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
        fontFamily: Fonts.serifSemiBold,
        fontSize: 32,
        color: Colors.text,
        letterSpacing: -0.3,
    },
    heading2: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 24,
        color: Colors.text,
        letterSpacing: -0.2,
    },
    heading3: {
        fontFamily: Fonts.serifSemiBold,
        fontSize: 20,
        color: Colors.text,
    },
    body: {
        fontFamily: Fonts.sansRegular,
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    caption: {
        fontFamily: Fonts.sansMedium,
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
