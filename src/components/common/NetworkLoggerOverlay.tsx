import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, StyleSheet } from 'react-native';
import NetworkLogger from 'react-native-network-logger';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const NetworkLoggerOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <NetworkLogger theme="light" />
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 16 }]}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      <View pointerEvents="box-none" style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>Logs</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    zIndex: 1000,
    elevation: 10,
    pointerEvents: 'box-none',
  },
  fab: {
    backgroundColor: '#222',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    left: 24,
    backgroundColor: '#222',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1001,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NetworkLoggerOverlay;
