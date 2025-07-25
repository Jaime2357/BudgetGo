import { styles } from '@/styles/global';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TableHeader({
  name,
  onSearch,
  onFilterPress,
}: {
  name: string;
  onSearch: (searchQuery?: string) => void;
  onFilterPress?: () => void; // new optional prop
}) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (searchQuery === '') {
      onSearch(undefined);
    }
  }, [searchQuery]);

  return (
    <>
      <View style={[styles.tableHeader, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        {/* Title */}
        <Text style={styles.tableHeaderText}>{name}</Text>

        {/* Filter Button */}
        {onFilterPress && (
          <TouchableOpacity onPress={onFilterPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="filter" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchBarSection}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchBarInput}
            onChangeText={(text) => setSearchQuery(text)}
            placeholder="Search"
            placeholderTextColor="#888"
            value={searchQuery}
          />
          <TouchableOpacity
            style={{ alignSelf: 'flex-end', margin: 'auto' }}
            onPress={() => onSearch(searchQuery)}
            accessibilityLabel="Search"
            accessibilityRole="button"
          >
            <MaterialIcons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
