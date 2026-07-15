// TestReportPage.tsx
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

interface TestReport {
  id: string;
  issueType: string;
  description: string;
  timestamp: Date;
  status: 'submitted' | 'processing' | 'resolved';
  backendResponse?: any;
}

const TestReportPage = () => {
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testReports, setTestReports] = useState<TestReport[]>([]);
  const [backendLog, setBackendLog] = useState<any[]>([]);

  const issueTypes = [
    { value: 'quantity-mismatch', label: 'Quantity mismatch' },
    { value: 'quality-issue', label: 'Quality issue (spoiled food)' },
    { value: 'delivery-problem', label: 'Delivery problem' },
    { value: 'volunteer-issue', label: 'Volunteer issue' },
    { value: 'other', label: 'Other' }
  ];

  // Mock backend API simulation
  const mockBackendAPI = async (reportData: any): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = {
          success: true,
          reportId: `RPT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: 'Report submitted successfully',
          data: reportData
        };
        resolve(response);
      }, 1500);
    });
  };

  const handleSubmit = async () => {
    if (!issueType || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    // Create report object
    const reportData = {
      issueType,
      description,
      timestamp: new Date(),
      testMode: true
    };

    try {
      // Log the data being sent
      const requestLog = {
        type: 'API_REQUEST',
        timestamp: new Date().toISOString(),
        data: reportData
      };
      setBackendLog(prev => [requestLog, ...prev]);

      // Simulate API call
      const response = await mockBackendAPI(reportData);

      // Log the response
      const responseLog = {
        type: 'API_RESPONSE',
        timestamp: new Date().toISOString(),
        data: response
      };
      setBackendLog(prev => [responseLog, ...prev]);

      // Save the test report
      const newReport: TestReport = {
        id: response.reportId,
        issueType,
        description,
        timestamp: new Date(),
        status: 'submitted',
        backendResponse: response
      };

      setTestReports(prev => [newReport, ...prev]);
      
      Alert.alert(
        "Success", 
        `Report submitted successfully!\n\nReport ID: ${response.reportId}\nBackend Response: ${JSON.stringify(response, null, 2)}`,
        [{ text: "OK" }]
      );

      // Reset form
      setIssueType('');
      setDescription('');

    } catch (error) {
      const errorLog = {
        type: 'API_ERROR',
        timestamp: new Date().toISOString(),
        error: error
      };
      setBackendLog(prev => [errorLog, ...prev]);
      
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillTestData = (type: string) => {
    const testDescriptions = {
      'quantity-mismatch': 'Test: Received only 5 items instead of the promised 10. Package was underweight and missing several canned goods.',
      'quality-issue': 'Test: Vegetables were wilted and bread was moldy. Items appear to be past expiration date and unsuitable for consumption.',
      'delivery-problem': 'Test: Delivery was 2 hours late and items were left in the rain. Packaging was damaged during transit.',
      'volunteer-issue': 'Test: Volunteer was rude and unprofessional. Failed to follow proper handling procedures for food items.',
      'other': 'Test: General issue with the donation process. Need to discuss alternative arrangements for future donations.'
    };

    setIssueType(type);
    setDescription(testDescriptions[type as keyof typeof testDescriptions] || 'Test description for reporting functionality.');
  };

  const clearLogs = () => {
    setBackendLog([]);
    setTestReports([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Test Report System</Text>
          <Text style={styles.subtitle}>Verify reporting functionality with mock backend</Text>
        </View>

        {/* Quick Test Buttons */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Quick Test Cases</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {issueTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.testCaseButton}
                onPress={() => fillTestData(type.value)}
              >
                <Text style={styles.testCaseText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Report Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Report Form</Text>
          
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
                <Ionicons
                  name={issueType === type.value ? "checkmark-circle" : "radio-button-off"}
                  size={20}
                  color={issueType === type.value ? COLORS.primary : COLORS.gray}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={6}
              placeholder="Describe the issue in detail..."
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!issueType || !description || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!issueType || !description || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Submitting..." : "Submit Test Report"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Backend Communication Log */}
        <View style={styles.logSection}>
          <View style={styles.logHeader}>
            <Text style={styles.sectionTitle}>Backend Communication</Text>
            <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear Logs</Text>
            </TouchableOpacity>
          </View>
          
          {backendLog.length === 0 ? (
            <Text style={styles.emptyLog}>No backend communication yet. Submit a test report to see the data flow.</Text>
          ) : (
            backendLog.map((log, index) => (
              <View key={index} style={[
                styles.logEntry,
                log.type === 'API_REQUEST' && styles.logRequest,
                log.type === 'API_RESPONSE' && styles.logResponse,
                log.type === 'API_ERROR' && styles.logError
              ]}>
                <Text style={styles.logType}>{log.type}</Text>
                <Text style={styles.logTimestamp}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                <Text style={styles.logData}>
                  {JSON.stringify(log.data || log.error, null, 2)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Submitted Reports */}
        <View style={styles.reportsSection}>
          <Text style={styles.sectionTitle}>Submitted Test Reports ({testReports.length})</Text>
          
          {testReports.length === 0 ? (
            <Text style={styles.emptyLog}>No test reports submitted yet.</Text>
          ) : (
            testReports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportId}>{report.id}</Text>
                  <Text style={styles.reportStatus}>{report.status}</Text>
                </View>
                <Text style={styles.reportType}>{report.issueType}</Text>
                <Text style={styles.reportDescription}>{report.description}</Text>
                <Text style={styles.reportTime}>
                  {report.timestamp.toLocaleString()}
                </Text>
              </View>
            ))
          )}
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
  },
  testSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginVertical: 8,
  },
  formSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginVertical: 8,
  },
  logSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginVertical: 8,
  },
  reportsSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginVertical: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  testCaseButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  testCaseText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    height: 120,
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
    marginTop: 8,
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: 12,
  },
  logEntry: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  logRequest: {
    backgroundColor: '#e3f2fd',
    borderLeftColor: '#2196f3',
  },
  logResponse: {
    backgroundColor: '#e8f5e8',
    borderLeftColor: '#4caf50',
  },
  logError: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
  },
  logType: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 4,
  },
  logData: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  emptyLog: {
    textAlign: 'center',
    color: COLORS.gray,
    fontStyle: 'italic',
    padding: 20,
  },
  reportCard: {
    backgroundColor: COLORS.lightWhite,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  reportStatus: {
    fontSize: 10,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reportType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  reportTime: {
    fontSize: 10,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
});

export default TestReportPage;