import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { RootStackParamList } from '../../App';

type ReceiptScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Receipt'>;
type ReceiptScreenRouteProp = RouteProp<RootStackParamList, 'Receipt'>;

interface Props {
  navigation: ReceiptScreenNavigationProp;
  route: ReceiptScreenRouteProp;
}

const ReceiptScreen: React.FC<Props> = ({ navigation, route }) => {
  const { receipt } = route.params;

  const handleShareReceipt = async () => {
    try {
      const receiptText = `SecureVote Receipt
Receipt ID: ${receipt.receiptId}
Vote ID: ${receipt.voteId}
Block Number: ${receipt.blockNumber}
Transaction: ${receipt.transactionHash}
Timestamp: ${new Date(receipt.timestamp).toLocaleString()}

Verify at: https://securevote.audit/verify/${receipt.receiptId}`;

      await Share.share({
        message: receiptText,
        title: 'Vote Receipt - SecureVote',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt');
    }
  };

  const handleBackToDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  const verificationUrl = `https://securevote.audit/verify/${receipt.receiptId}`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vote Cast Successfully!</Text>
        <Text style={styles.subtitle}>Your vote has been recorded on the blockchain</Text>
      </View>

      <View style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptTitle}>Vote Receipt</Text>
          <Text style={styles.receiptSubtitle}>Keep this for verification</Text>
        </View>

        <View style={styles.receiptDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Receipt ID:</Text>
            <Text style={styles.detailValue}>{receipt.receiptId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vote ID:</Text>
            <Text style={styles.detailValue}>{receipt.voteId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Block Number:</Text>
            <Text style={styles.detailValue}>{receipt.blockNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction:</Text>
            <Text style={styles.detailValueSmall}>{receipt.transactionHash}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Timestamp:</Text>
            <Text style={styles.detailValue}>
              {new Date(receipt.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.qrContainer}>
          <Text style={styles.qrLabel}>Scan to verify your vote:</Text>
          <View style={styles.qrCodeWrapper}>
            <QRCode
              value={verificationUrl}
              size={150}
              backgroundColor="white"
              color="black"
            />
          </View>
          <Text style={styles.qrUrl}>{verificationUrl}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🔒 Your Privacy is Protected</Text>
        <Text style={styles.infoText}>
          Your vote is encrypted and anonymous. This receipt proves your vote was recorded 
          without revealing who you voted for.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareReceipt}
        >
          <Text style={styles.shareButtonText}>Share Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleBackToDashboard}
        >
          <Text style={styles.doneButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for participating in the democratic process!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  receiptSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  receiptDetails: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  detailValueSmall: {
    fontSize: 12,
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  qrContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  qrUrl: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ReceiptScreen;