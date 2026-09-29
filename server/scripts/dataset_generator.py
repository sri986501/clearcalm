"""
Insurance Document Synthetic Dataset Generator
Generates realistic academic insurance policy documents and structured ground-truth datasets.
Ensures ZERO data leakage (documents never contain labels or red flag text).
"""

import os
import random
import json
import csv
from datetime import datetime, timedelta

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

# Realistic seed lists
INSURERS = [
    "Falcon Mutual Insurance Ltd.",
    "Apex General Insurance Corp.",
    "Heritage National Assurance",
    "BlueShield Commercial Underwriters",
    "Vanguard Life & Asset Assurance",
    "Zenith Premier Insurance Co.",
    "StarGuard Indemnity Group",
    "Pinnacle Mutual Risk Corp."
]

POLICY_TYPES = [
    {"type": "Business Insurance", "rate_range": (2.5, 3.5), "cov_min": 1000000, "cov_max": 5000000},
    {"type": "Commercial Property Insurance", "rate_range": (1.8, 2.8), "cov_min": 2000000, "cov_max": 10000000},
    {"type": "Comprehensive Commercial Liability", "rate_range": (1.2, 2.2), "cov_min": 1500000, "cov_max": 6000000},
    {"type": "Corporate Fleet & Asset Cover", "rate_range": (3.0, 4.5), "cov_min": 800000, "cov_max": 3500000},
    {"type": "Industrial All-Risk Policy", "rate_range": (2.0, 3.2), "cov_min": 3000000, "cov_max": 15000000}
]

CITIES = ["Mumbai", "Bengaluru", "Hyderabad", "New Delhi", "Chennai", "Pune", "Kolkata", "Ahmedabad"]

POLICYHOLDERS = [
    "Divya Krishnan", "Rajesh Sharma", "Priya Venkatesh", "Arjun Patel", 
    "Sunita Mehra", "Anand Rao", "Kavita Nair", "Rohan Gupta", 
    "Siddharth Verma", "Neha Deshmukh", "Vikram Reddy", "Deepa Joshi",
    "Amitabh Sengupta", "Meera Kulkarni", "Tarun Kapoor", "Sangeeta Banerjee"
]

ANOMALY_TYPES = [
    "invalid_expiry_date",          # Expiry before effective date
    "premium_mismatch",             # Document premium differs significantly from coverage * rate
    "coverage_mismatch",            # Coverage numbers inconsistent
    "insurer_mismatch",             # Header insurer differs from signature/body insurer
    "policy_number_format_error",   # Format violation
    "missing_mandatory_field",      # Omitted field
    "invalid_deductible",           # Deductible negative or exceeds coverage
    "incorrect_premium_rate",       # Rate arithmetic contradicts premium
    "inconsistent_policy_type",     # Type doesn't match underwriting category
    "multiple_anomalies"            # Date reversed + premium mismatch
]

def generate_policy_number(idx, force_corrupt=False):
    year = 2026
    if force_corrupt:
        return f"INVALID#{idx:04d}-XX"
    return f"POL-{year}-{idx:04d}"

def generate_single_record(record_id, is_anomaly=False, anomaly_type=None, random_gen=None):
    rg = random_gen or random.Random()
    
    insurer_expected = rg.choice(INSURERS)
    insurer_doc = insurer_expected
    
    pt_info = rg.choice(POLICY_TYPES)
    policy_type = pt_info["type"]
    
    policyholder = rg.choice(POLICYHOLDERS)
    city = rg.choice(CITIES)
    
    # Dates
    start_date = datetime(2026, rg.randint(1, 4), rg.randint(1, 28))
    effective_date_str = start_date.strftime("%Y-%m-%d")
    
    exp_date = start_date + timedelta(days=365)
    expiry_expected_str = exp_date.strftime("%Y-%m-%d")
    expiry_doc_str = expiry_expected_str
    
    # Financials
    cov_step = 100000
    coverage_expected = rg.randint(pt_info["cov_min"] // cov_step, pt_info["cov_max"] // cov_step) * cov_step
    coverage_doc = coverage_expected
    
    rate_percent = round(rg.uniform(pt_info["rate_range"][0], pt_info["rate_range"][1]), 1)
    premium_expected = int(round(coverage_expected * (rate_percent / 100.0)))
    premium_doc = premium_expected
    
    deductible = rg.choice([5000, 10000, 15000, 25000, 50000])
    
    policy_num_expected = generate_policy_number(record_id)
    policy_num_doc = policy_num_expected
    
    verification_label = "CONSISTENT"
    red_flags = []
    
    if is_anomaly:
        verification_label = "NEEDS_REVIEW"
        if not anomaly_type:
            anomaly_type = rg.choice(ANOMALY_TYPES)
            
        if anomaly_type == "invalid_expiry_date":
            # Expiry is 60 days before effective date
            reversed_date = start_date - timedelta(days=rg.randint(30, 90))
            expiry_doc_str = reversed_date.strftime("%Y-%m-%d")
            red_flags.append("Expiry date is earlier than effective date.")
            
        elif anomaly_type == "premium_mismatch":
            # Discrepancy of 25% - 60%
            multiplier = rg.choice([0.5, 1.4, 1.7, 2.1])
            premium_doc = int(premium_expected * multiplier)
            red_flags.append(f"Document premium (INR {premium_doc:,}) contradicts calculated premium (INR {premium_expected:,} based on {rate_percent}% of INR {coverage_doc:,}).")
            
        elif anomaly_type == "insurer_mismatch":
            alt_insurer = rg.choice([i for i in INSURERS if i != insurer_expected])
            insurer_doc = alt_insurer
            red_flags.append(f"Insurer identity discrepancy: Registered '{insurer_expected}' vs Document Header '{insurer_doc}'.")
            
        elif anomaly_type == "policy_number_format_error":
            policy_num_doc = generate_policy_number(record_id, force_corrupt=True)
            red_flags.append(f"Policy identifier format violation: '{policy_num_doc}' does not match standard 'POL-YYYY-XXXX' schema.")
            
        elif anomaly_type == "coverage_mismatch":
            coverage_doc = int(coverage_expected * rg.choice([0.6, 1.5]))
            red_flags.append("Coverage sum insured discrepancy between policy schedule and schedule of benefits.")
            
        elif anomaly_type == "missing_mandatory_field":
            policyholder = "" # Omitted policyholder
            red_flags.append("Mandatory underwriting field 'Policyholder Name' is missing.")
            
        elif anomaly_type == "invalid_deductible":
            deductible = coverage_doc + 50000
            red_flags.append(f"Invalid deductible: INR {deductible:,} exceeds entire policy sum insured (INR {coverage_doc:,}).")
            
        elif anomaly_type == "incorrect_premium_rate":
            rate_percent = 9.8 # Highly erratic rate
            premium_doc = int(coverage_doc * 0.02) # Premium calculated with different rate
            red_flags.append(f"Stated premium rate ({rate_percent}%) contradicts annual premium calculation.")
            
        elif anomaly_type == "inconsistent_policy_type":
            policy_type = "Personal Scooter Comprehensive" # Mismatched with commercial underwriter
            red_flags.append("Policy classification inconsistent with underwriting schedule specifications.")
            
        elif anomaly_type == "multiple_anomalies":
            reversed_date = start_date - timedelta(days=45)
            expiry_doc_str = reversed_date.strftime("%Y-%m-%d")
            premium_doc = int(premium_expected * 1.6)
            red_flags.append("Expiry date is earlier than effective date.")
            red_flags.append("Document premium differs from computed schedule rate.")

    # Generate document text (STRICT NO-LEAKAGE: no labels or red flags!)
    doc_text = f"""================================================================================
OFFICIAL SCHEDULE OF INSURANCE & POLICY CERTIFICATE
{insurer_doc.upper()}
Underwriting & Risk Assurance Division | Certificate ID: {policy_num_doc}
================================================================================

1. POLICY IDENTIFICATION & HOLDER DETAILS
--------------------------------------------------------------------------------
Policy Number:       {policy_num_doc if policy_num_doc else '[NOT SPECIFIED]'}
Insurer Name:        {insurer_doc}
Policyholder Name:   {policyholder if policyholder else '[MANDATORY HOLDER RECORD OMITTED]'}
Operating Location:  {city}, India
Policy Type:         {policy_type}

2. TERM & PERIOD OF COVERAGE
--------------------------------------------------------------------------------
Inception / Effective Date:  {effective_date_str}
Policy Expiration Date:     {expiry_doc_str}
Policy Duration:            Standard 12-Month Annual Term

3. FINANCIAL UNDERWRITING & PREMIUM SCHEDULE
--------------------------------------------------------------------------------
Total Sum Insured / Coverage:   INR {coverage_doc:,}
Applicable Premium Rate:        {rate_percent}% per annum
Standard Compulsory Deductible: INR {deductible:,}
Total Annual Premium Payable:   INR {premium_doc:,}

4. CLAIMS & VERIFICATION ATTESTATION
--------------------------------------------------------------------------------
This insurance schedule represents the primary contractual basis between the named 
policyholder and {insurer_doc}. All claims submitted under Policy {policy_num_doc} 
must satisfy the covenants, warranties, and deductible thresholds described herein.

Disclaimer: This document is artificially generated for academic/software testing 
purposes and is not a real insurance policy.
================================================================================
"""

    record = {
        "record_id": f"REC-{record_id:05d}",
        "insurer_name_expected": insurer_expected,
        "insurer_name_in_document": insurer_doc,
        "policy_number_expected": policy_num_expected,
        "policy_number_in_document": policy_num_doc,
        "policy_type": policy_type,
        "policyholder_name": policyholder,
        "city": city,
        "effective_date": effective_date_str,
        "expiry_date_expected": expiry_expected_str,
        "expiry_date_in_document": expiry_doc_str,
        "coverage_expected_inr": coverage_expected,
        "coverage_inr": coverage_doc,
        "premium_expected_inr": premium_expected,
        "premium_inr": premium_doc,
        "deductible_inr": deductible,
        "premium_rate_percent": rate_percent,
        "verification_label": verification_label,
        "anomaly_type": anomaly_type if is_anomaly else "none",
        "red_flags": " | ".join(red_flags) if red_flags else "None",
        "document_text": doc_text
    }
    
    return record

def build_pdf_document(record, output_pdf_path):
    if not HAS_REPORTLAB:
        return False
    try:
        doc = SimpleDocTemplate(
            output_pdf_path,
            pagesize=letter,
            rightMargin=36, leftMargin=36,
            topMargin=36, bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        normal = styles['Normal']
        
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#1E3A8A'),
            alignment=1
        )
        
        sub_style = ParagraphStyle(
            'DocSub',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#4B5563'),
            alignment=1
        )
        
        sec_style = ParagraphStyle(
            'DocSec',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#1E3A8A')
        )
        
        val_style = ParagraphStyle(
            'DocVal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#1F2937')
        )
        
        val_bold = ParagraphStyle(
            'DocValB',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#111827')
        )
        
        disclaimer_style = ParagraphStyle(
            'DocDisc',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#6B7280'),
            alignment=1
        )
        
        elements = []
        
        # Header
        elements.append(Paragraph(record["insurer_name_in_document"], title_style))
        elements.append(Paragraph("OFFICIAL SCHEDULE OF INSURANCE & POLICY CERTIFICATE", sub_style))
        elements.append(Paragraph(f"Certificate Ref: {record['policy_number_in_document']}", sub_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1E3A8A'), spaceBefore=2, spaceAfter=10))
        
        # Section 1: Identification
        elements.append(Paragraph("1. POLICY IDENTIFICATION & HOLDER DETAILS", sec_style))
        elements.append(Spacer(1, 4))
        
        data1 = [
            [Paragraph("Policy Number:", val_bold), Paragraph(record["policy_number_in_document"] or "[OMITTED]", val_style),
             Paragraph("Operating Location:", val_bold), Paragraph(record["city"], val_style)],
            [Paragraph("Insurer Name:", val_bold), Paragraph(record["insurer_name_in_document"], val_style),
             Paragraph("Policyholder Name:", val_bold), Paragraph(record["policyholder_name"] or "[NOT SPECIFIED]", val_style)],
            [Paragraph("Policy Category:", val_bold), Paragraph(record["policy_type"], val_style),
             Paragraph("Jurisdiction:", val_bold), Paragraph("Republic of India", val_style)],
        ]
        t1 = Table(data1, colWidths=[110, 160, 110, 160])
        t1.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F9FAFB')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        elements.append(t1)
        elements.append(Spacer(1, 12))
        
        # Section 2: Coverage Period
        elements.append(Paragraph("2. TERM & PERIOD OF COVERAGE", sec_style))
        elements.append(Spacer(1, 4))
        data2 = [
            [Paragraph("Effective Date:", val_bold), Paragraph(record["effective_date"], val_style),
             Paragraph("Policy Expiry Date:", val_bold), Paragraph(record["expiry_date_in_document"], val_style)],
            [Paragraph("Duration:", val_bold), Paragraph("Standard 12-Month Term", val_style),
             Paragraph("Renewal Grace:", val_bold), Paragraph("30 Calendar Days", val_style)],
        ]
        t2 = Table(data2, colWidths=[110, 160, 110, 160])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F9FAFB')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        elements.append(t2)
        elements.append(Spacer(1, 12))
        
        # Section 3: Financial Schedule
        elements.append(Paragraph("3. FINANCIAL UNDERWRITING & PREMIUM SCHEDULE", sec_style))
        elements.append(Spacer(1, 4))
        data3 = [
            [Paragraph("Total Sum Insured:", val_bold), Paragraph(f"INR {record['coverage_inr']:,}", val_style),
             Paragraph("Applicable Rate:", val_bold), Paragraph(f"{record['premium_rate_percent']}% p.a.", val_style)],
            [Paragraph("Compulsory Deductible:", val_bold), Paragraph(f"INR {record['deductible_inr']:,}", val_style),
             Paragraph("Annual Premium:", val_bold), Paragraph(f"INR {record['premium_inr']:,}", val_bold)],
        ]
        t3 = Table(data3, colWidths=[110, 160, 110, 160])
        t3.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F9FAFB')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        elements.append(t3)
        elements.append(Spacer(1, 14))
        
        # Section 4: Attestation
        elements.append(Paragraph("4. CLAIMS & UNDERWRITING ATTESTATION", sec_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(
            f"This insurance certificate represents the primary contractual basis between the named policyholder and {record['insurer_name_in_document']}. All claims submitted under Policy {record['policy_number_in_document']} must satisfy the covenants, warranties, and deductible thresholds described in the policy schedule.",
            val_style
        ))
        elements.append(Spacer(1, 20))
        
        # Academic disclaimer footer
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#D1D5DB'), spaceBefore=5, spaceAfter=8))
        elements.append(Paragraph(
            "This document is artificially generated for academic/software testing purposes and is not a real insurance policy.",
            disclaimer_style
        ))
        
        doc.build(elements)
        return True
    except Exception as e:
        print(f"PDF build error for {output_pdf_path}: {e}")
        return False

def generate_dataset(
    train_count=520,
    val_count=110,
    test_count=110,
    anomaly_ratio=0.35,
    seed=42,
    output_dir="./data"
):
    rg = random.Random(seed)
    os.makedirs(output_dir, exist_ok=True)
    
    splits = {
        "train": train_count,
        "validation": val_count,
        "test": test_count
    }
    
    global_idx = 1
    stats = {}
    
    for split_name, count in splits.items():
        records = []
        split_docs_dir = os.path.join(output_dir, "documents", split_name)
        os.makedirs(split_docs_dir, exist_ok=True)
        
        num_anomalies = int(count * anomaly_ratio)
        num_consistent = count - num_anomalies
        
        anomaly_flags = [True] * num_anomalies + [False] * num_consistent
        rg.shuffle(anomaly_flags)
        
        split_stats = {"total": count, "consistent": 0, "needs_review": 0, "anomaly_types": {}}
        
        for is_anomaly in anomaly_flags:
            rec = generate_single_record(global_idx, is_anomaly=is_anomaly, random_gen=rg)
            records.append(rec)
            
            # Save raw document text
            txt_path = os.path.join(split_docs_dir, f"{rec['record_id']}.txt")
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(rec["document_text"])
                
            # If sample or test, generate PDF
            if global_idx <= 25 or split_name == "test" and global_idx % 4 == 0:
                pdf_path = os.path.join(split_docs_dir, f"{rec['record_id']}.pdf")
                build_pdf_document(rec, pdf_path)
                
            global_idx += 1
            
            if is_anomaly:
                split_stats["needs_review"] += 1
                atype = rec["anomaly_type"]
                split_stats["anomaly_types"][atype] = split_stats["anomaly_types"].get(atype, 0) + 1
            else:
                split_stats["consistent"] += 1
                
        # Save CSV (ground-truth dataset with labels separated from document text)
        csv_path = os.path.join(output_dir, f"{split_name}.csv")
        fieldnames = [k for k in records[0].keys() if k != "document_text"]
        
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in records:
                row = {k: v for k, v in r.items() if k != "document_text"}
                writer.writerow(row)
                
        stats[split_name] = split_stats
        print(f"Generated {split_name} split: {count} docs ({split_stats['consistent']} Consistent, {split_stats['needs_review']} Needs Review)")

    # Save metadata
    meta = {
        "generated_at": datetime.now().isoformat(),
        "random_seed": seed,
        "splits": stats,
        "anomaly_categories": ANOMALY_TYPES,
        "total_documents": train_count + val_count + test_count
    }
    with open(os.path.join(output_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
        
    print("Dataset generation completed successfully!")
    return meta

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "../data")
    generate_dataset(output_dir=data_dir)
