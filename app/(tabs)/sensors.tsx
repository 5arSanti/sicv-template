import { BarometerCard } from '@/components/Barometer';
import { BatteryCard } from '@/components/Battery';
import { CellularCard } from '@/components/Cellular';
import { LocalizationCard } from '@/components/Localization';
import { LocationCard } from '@/components/Location';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/constants/Styles';
import { Image } from 'expo-image';

export default function SensorsScreen() {


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={globalStyles.reactLogo}
        />
      }>
      <ThemedView style={globalStyles.titleContainer}>
        <ThemedText type="title">Sensors Data</ThemedText>
      </ThemedView>

      <BarometerCard />

      <BatteryCard />

      <CellularCard />

      <LocalizationCard />

      <LocationCard />
    </ParallaxScrollView>
  );
}