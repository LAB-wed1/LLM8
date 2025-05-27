import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { testFirestoreConnection, db } from '../api/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const FirestoreConnectionTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [listenStatus, setListenStatus] = useState(null);
  const [error, setError] = useState(null);
  const [unsubscribe, setUnsubscribe] = useState(null);

  // ทดสอบการเชื่อมต่อแบบปกติ (ไม่ใช่ realtime)
  const runConnectionTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const testResult = await testFirestoreConnection();
      setResult(testResult);
    } catch (err) {
      setError(`Unexpected error: ${err.message}`);
      console.error('Connection test error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ทดสอบการเชื่อมต่อแบบ Realtime Listener
  const testRealtimeListener = () => {
    setListenStatus('connecting');
    setError(null);
    
    try {
      // ถ้ามีการ subscribe เดิมอยู่ ให้ยกเลิกก่อน
      if (unsubscribe) {
        unsubscribe();
      }
      
      // เริ่มการ listen ใหม่
      const testRef = doc(db, 'system', 'status');
      
      const unsub = onSnapshot(
        testRef,
        (docSnap) => {
          setListenStatus('active');
          console.log('Realtime data:', docSnap.data());
        },
        (err) => {
          setListenStatus('error');
          setError(`Listener error: ${err.code} - ${err.message}`);
          console.error('Listener error:', err);
        }
      );
      
      setUnsubscribe(() => unsub);
    } catch (err) {
      setListenStatus('error');
      setError(`Listener setup error: ${err.message}`);
      console.error('Listener setup error:', err);
    }
  };

  // ยกเลิกการ listen
  const stopRealtimeListener = () => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
      setListenStatus('stopped');
    }
  };

  // ทำความสะอาดเมื่อคอมโพเนนต์ถูกยกเลิก
  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ทดสอบการเชื่อมต่อ Firestore</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. ทดสอบการเชื่อมต่อแบบปกติ</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={runConnectionTest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ทดสอบการเชื่อมต่อ</Text>
          )}
        </TouchableOpacity>
        
        {result && (
          <View style={[styles.resultContainer, 
            result.success ? styles.successResult : styles.errorResult]}>
            <Text style={styles.resultText}>
              {result.success 
                ? '✓ เชื่อมต่อสำเร็จ'
                : `✗ เชื่อมต่อล้มเหลว: ${result.error}`}
            </Text>
            {result.details && (
              <Text style={styles.detailText}>{result.details}</Text>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. ทดสอบการเชื่อมต่อแบบ Realtime</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.halfButton]}
            onPress={testRealtimeListener}
            disabled={listenStatus === 'connecting' || listenStatus === 'active'}
          >
            <Text style={styles.buttonText}>เริ่ม Listen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.halfButton, styles.secondaryButton]}
            onPress={stopRealtimeListener}
            disabled={!unsubscribe}
          >
            <Text style={styles.buttonText}>หยุด Listen</Text>
          </TouchableOpacity>
        </View>
        
        {listenStatus && (
          <View style={[styles.resultContainer, 
            listenStatus === 'active' ? styles.successResult :
            listenStatus === 'error' ? styles.errorResult :
            styles.pendingResult]}>
            <Text style={styles.resultText}>
              {listenStatus === 'connecting' && '⟳ กำลังเชื่อมต่อ...'}
              {listenStatus === 'active' && '✓ การฟังแบบเรียลไทม์ทำงานอยู่'}
              {listenStatus === 'error' && '✗ การฟังแบบเรียลไทม์ล้มเหลว'}
              {listenStatus === 'stopped' && '⏹ หยุดการฟังแล้ว'}
            </Text>
          </View>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>ข้อผิดพลาด:</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.tipText}>
            ข้อแนะนำในการแก้ไข:
          </Text>
          <Text style={styles.tipItem}>
            1. ตรวจสอบ Firestore Rules ว่าอนุญาตให้อ่านและเขียนข้อมูลหรือไม่
          </Text>
          <Text style={styles.tipItem}>
            2. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
          </Text>
          <Text style={styles.tipItem}>
            3. หากเกิดข้อผิดพลาด RPC 'Listen', อาจต้องปรับแก้ค่า rules เพิ่มเติม
          </Text>
          <Text style={styles.codeBlock}>
            {`// ตัวอย่าง Firestore Rules ที่แนะนำ\nrules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}`}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfButton: {
    flex: 0.48,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 6,
  },
  successResult: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  errorResult: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  pendingResult: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
  },
  resultText: {
    fontSize: 15,
    fontWeight: '500',
  },
  detailText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 6,
    padding: 16,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    marginBottom: 16,
  },
  tipText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f1f1f1',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
});

export default FirestoreConnectionTest; 