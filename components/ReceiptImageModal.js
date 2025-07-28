import { Modal, View, TouchableOpacity, Text, Image, ScrollView } from "react-native";

export default function ReceiptImageModal({ visible, image, onClose, error }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, right: 30, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 }}
          onPress={onClose}
        >
          <Text style={{ fontSize: 28, color: '#fff' }}>✕</Text>
        </TouchableOpacity>
        {image ? (
          <ScrollView
            style={{ flex: 1, width: '100%', height: '100%' }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
            maximumZoomScale={3}
            minimumZoomScale={1}
            horizontal
          >
            <ScrollView
              style={{ flex: 1, width: '100%', height: '100%' }}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
              maximumZoomScale={3}
              minimumZoomScale={1}
            >
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
              />
            </ScrollView>
          </ScrollView>
        ) : (
          <Text style={{ color: '#fff', fontSize: 16 }}>{error || 'No image found.'}</Text>
        )}
      </View>
    </Modal>
  );
} 