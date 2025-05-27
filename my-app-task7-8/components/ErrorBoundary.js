import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, errorInfo: error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to a service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <View style={styles.container}>
          <Ionicons name="alert-circle" size={80} color="#FF6347" />
          <Text style={styles.errorTitle}>พบข้อผิดพลาดในแอปพลิเคชัน</Text>
          <Text style={styles.errorMessage}>
            {this.state.errorInfo?.toString() || 'กรุณาลองอีกครั้ง หรือติดต่อผู้ดูแลระบบ'}
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={this.resetError}>
            <Text style={styles.resetButtonText}>ลองอีกครั้ง</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // If no error occurred, render children normally
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#2E86C1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 2,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ErrorBoundary;
