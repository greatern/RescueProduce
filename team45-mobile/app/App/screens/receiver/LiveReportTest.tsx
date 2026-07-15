// LiveReportTest.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../../constants';

const LiveReportTest = () => {
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string>('');

  const issueTypes = [
    { value: 'quantity-mismatch', label: 'Quantity mismatch' },
    { value: 'quality-issue', label: 'Quality issue (spoiled food)' },
    { value: 'delivery-problem', label: 'Delivery problem' },
    { value: 'volunteer-issue', label: 'Volunteer issue' },
    { value: 'other', label: 'Other' }
  ];

  // REAL API call to your backend
  const submitRealReport = async (reportData: any) => {
    // Replace with your actual API endpoint
    const API_URL = 'https://localhost:5001/api/reports';
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-test-token', // Add if needed
        },
        body: JSON.stringify({
          ...reportData,
          test: true, // Mark as test for backend identification
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleRealSubmit = async () => {
    if (!issueType || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    setApiResponse(null);

    const reportData = {
      issueType,
      description,
      metadata: {
        test: true,
        platform: 'react-native',
        version: '1.0.0'
      }
    };

    try {
      console.log('Sending to backend:', reportData);
      
      const response = await submitRealReport(reportData);
      
      setApiResponse(response);
      console.log('Backend response:', response);
      
      Alert.alert(
        "Real API Success", 
        `Report submitted to actual backend!\n\nResponse: ${JSON.stringify(response, null, 2)}`
      );

      // Reset form on success
      setIssueType('');
      setDescription('');

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setApiError(errorMsg);
      console.error('API Error:', error);
      
      Alert.alert(
        "Real API Error", 
        `Failed to submit to backend:\n${errorMsg}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const testEndpointConnection = async () => {
    try {
      const response = await fetch('https://localhost:5001/api/health');
      if (response.ok) {
        Alert.alert('Connection Test', '✅ Backend is reachable!');
      } else {
        Alert.alert('Connection Test', '❌ Backend responded with error');
      }
    } catch (error) {
      Alert.alert('Connection Test', '❌ Cannot reach backend server');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Backend Test</Text>
          <Text style={styles.subtitle}>Test with actual backend API</Text>
          
          <TouchableOpacity 
            style={styles.connectionTestButton}
            onPress={testEndpointConnection}
          >
            <Text style={styles.connectionTestText}>Test Backend Connection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Report Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Issue Type</Text>
            {issueTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.optionButton,
                  issueType === type.value && styles.optionButtonSelected
                ]}
                onPress={() => setIssueType(type.value)}
              >
                <Text style={[
                  styles.optionText,
                  issueType === type.value && styles.optionTextSelected
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Describe the issue for backend testing..."
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!issueType || !description || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleRealSubmit}
            disabled={!issueType || !description || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Sending to Backend..." : "Submit to Real Backend"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* API Response Display */}
        <View style={styles.responseSection}>
          <Text style={styles.sectionTitle}>API Response</Text>
          
          {apiError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>❌ Error</Text>
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          ) : apiResponse ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>✅ Success</Text>
              <Text style={styles.responseText}>
                {JSON.stringify(apiResponse, null, 2)}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>
              Submit a report to see backend response...
            </Text>
          )}
        </View>

        {/* Request Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Request Preview</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {JSON.stringify({
                issueType,
                description,
                test: true,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  connectionTestButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectionTestText: {
    color: 'white',
    fontWeight: 'bold',
  },
  formSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  responseSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  previewSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    margin: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: COLORS.lightWhite,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    backgroundColor: COLORS.lightWhite,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
  },
  successBox: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#2e7d32',
  },
  placeholderText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontStyle: 'italic',
    padding: 20,
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.primary,
  },
});

export default LiveReportTest;