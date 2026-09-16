
import { Link } from 'expo-router';
import { Text, View, ScrollView } from 'react-native';

export default function MenuPage() {
  return (
    <ScrollView style={{flex: 1, backgroundColor: '#0A0B14'}}>
      <View style={{padding: 24}}>
        <Link href="/" style={{color: '#8B5CF6', marginBottom: 16}}>← Back</Link>
        <Text style={{fontSize: 32, fontWeight: 'bold', color: 'white', fontFamily: 'Bodoni Moda'}}>Menu Boards</Text>
        <Text style={{color: '#9CA3AF', marginTop: 8}}>Your public menu link will live here</Text>
      </View>
    </ScrollView>
  );
}
