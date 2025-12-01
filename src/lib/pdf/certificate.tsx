import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 10,
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  details: {
    marginTop: 20,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
});

interface CertificateProps {
  name: string;
  shares: number;
  amount: number;
  date: string;
  certificateNumber: string;
}

export const ShareCertificateDocument: React.FC<CertificateProps> = ({ name, shares, amount, date, certificateNumber }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Mayday Saxonvale Community Benefit Society</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.title}>SHARE CERTIFICATE</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.details}>
          This is to certify that
        </Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 10 }}>{name}</Text>
        <Text style={styles.details}>
          is the registered holder of {shares} Withdraw table Shares of £1.00 each.
        </Text>
        <Text style={styles.details}>
          Total Investment: £{amount.toLocaleString('en-GB')}
        </Text>
      </View>

      <View style={{ marginTop: 40, padding: 10 }}>
        <Text>Certificate Number: {certificateNumber}</Text>
        <Text>Date of Issue: {date}</Text>
      </View>

      <View style={styles.footer}>
        <Text>Mayday Saxonvale CBS | Registered Society Number: 9146</Text>
      </View>
    </Page>
  </Document>
);

export async function generateCertificateStream(props: CertificateProps) {
  return await renderToStream(<ShareCertificateDocument {...props} />);
}

