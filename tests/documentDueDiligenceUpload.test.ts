import { describe, test, expect } from 'bun:test';
import {
  formatBytes,
  DOCUMENT_CATEGORIES,
} from '../src/components/forms/DocumentDueDiligenceUpload';
import { MockAssetService } from '../src/services/mockAssetService';

describe('Document Due Diligence Drag and Drop Upload System', () => {
  test('formatBytes correctly formats byte sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(5242880)).toBe('5 MB');
    expect(formatBytes(3250585)).toBe('3.1 MB');
  });

  test('DOCUMENT_CATEGORIES contains all required institutional compliance types', () => {
    expect(DOCUMENT_CATEGORIES).toContain('Valuation Certificate');
    expect(DOCUMENT_CATEGORIES).toContain('Ownership Documents');
    expect(DOCUMENT_CATEGORIES).toContain('Legal Documentation');
    expect(DOCUMENT_CATEGORIES).toContain('Property Images');
  });

  test('Submitting asset with uploaded due diligence documents preserves all files', () => {
    const uploadedDocs = [
      {
        id: 'doc-custom-1',
        name: 'Deloitte_Valuation_Report_2026.pdf',
        type: 'Valuation Certificate',
        size: '6.4 MB',
        verifiedDate: '2026-02-10',
        url: '#',
      },
      {
        id: 'doc-custom-2',
        name: 'Government_Land_Title_Registry.pdf',
        type: 'Ownership Documents',
        size: '3.8 MB',
        verifiedDate: '2026-02-10',
        url: '#',
      },
      {
        id: 'doc-custom-3',
        name: 'SPV_Charter_and_Bylaws.pdf',
        type: 'Legal Documentation',
        size: '2.1 MB',
        verifiedDate: '2026-02-10',
        url: '#',
      },
    ];

    const submitted = MockAssetService.submitAsset({
      name: 'CyberGateway Tower D',
      category: 'Commercial',
      totalValuation: 18000000,
      tokenPrice: 50,
      totalTokenSupply: 360000,
      minimumInvestment: 100,
      expectedYield: 11.8,
      description: 'Institutional Grade-A corporate office building.',
      location: {
        address: '100 Outer Ring Road',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        flag: '🇮🇳',
      },
      ownership: {
        issuerName: 'NexGen Assets',
        entityName: 'Tower D SPV Ltd',
        structure: 'Special Purpose Vehicle LLC',
        registrationNumber: 'CIN-U12345KA2026',
        country: 'India',
      },
      documents: uploadedDocs,
      submittedBy: 'issuer@assetx.demo',
    });

    expect(submitted.documents).toBeDefined();
    expect(submitted.documents.length).toBe(3);
    expect(submitted.documents[0].name).toBe('Deloitte_Valuation_Report_2026.pdf');
    expect(submitted.documents[0].size).toBe('6.4 MB');
    expect(submitted.documents[1].name).toBe('Government_Land_Title_Registry.pdf');
    expect(submitted.documents[2].name).toBe('SPV_Charter_and_Bylaws.pdf');
  });
});
