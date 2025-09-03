#!/usr/bin/env python3
"""
Soil Fertility Report Generator
Generates PDF and CSV reports from soil prediction data
"""

import json
import sys
import os
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import seaborn as sns

def read_input():
    """Read JSON input from stdin"""
    try:
        input_data = sys.stdin.read()
        return json.loads(input_data)
    except Exception as e:
        print(f"Error reading input: {e}", file=sys.stderr)
        sys.exit(1)

def generate_charts(report_data, report_id):
    """Generate charts for the report"""
    
    # Set style for better looking plots
    plt.style.use('seaborn-v0_8')
    sns.set_palette("husl")
    
    soil_features = report_data['soil_features']
    prediction = report_data['prediction']
    
    # Chart 1: Nutrient levels bar chart
    nutrients = ['Nitrogen', 'Phosphorus', 'Potassium']
    values = [soil_features['nitrogen'], soil_features['phosphorus'], soil_features['potassium']]
    
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 10))
    fig.suptitle('Soil Analysis Report - Visual Summary', fontsize=16, fontweight='bold')
    
    # Nutrient levels
    bars = ax1.bar(nutrients, values, color=['#FF6B6B', '#4ECDC4', '#45B7D1'])
    ax1.set_title('Primary Nutrients (NPK)', fontweight='bold')
    ax1.set_ylabel('Concentration (ppm)')
    for bar, value in zip(bars, values):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                f'{value}', ha='center', va='bottom', fontweight='bold')
    
    # pH gauge
    ph_value = soil_features['ph']
    ph_colors = ['red' if ph_value < 6.0 else 'orange' if ph_value < 7.0 else 'green' if ph_value < 8.0 else 'red']
    ax2.bar(['pH Level'], [ph_value], color=ph_colors, width=0.5)
    ax2.set_title('Soil pH Level', fontweight='bold')
    ax2.set_ylabel('pH Scale')
    ax2.set_ylim(0, 14)
    ax2.axhline(y=6.0, color='orange', linestyle='--', alpha=0.7, label='Acidic')
    ax2.axhline(y=7.0, color='green', linestyle='--', alpha=0.7, label='Neutral')
    ax2.axhline(y=8.0, color='orange', linestyle='--', alpha=0.7, label='Alkaline')
    ax2.text(0, ph_value + 0.2, f'{ph_value}', ha='center', va='bottom', fontweight='bold', fontsize=14)
    
    # Fertility score pie chart
    fertility_score = prediction.get('fertility_score', 0) * 100
    colors_pie = ['#FF6B6B', '#FFE66D', '#4ECDC4']
    labels = ['Poor\n(0-50)', 'Fair\n(50-75)', 'Good\n(75-100)']
    sizes = [max(0, min(50, fertility_score)), 
             max(0, min(25, fertility_score - 50)) if fertility_score > 50 else 0,
             max(0, fertility_score - 75) if fertility_score > 75 else 0]
    sizes = [50, 25, 25]  # Base sizes
    
    wedges, texts, autotexts = ax3.pie([1], labels=[f'Fertility Score\n{fertility_score:.1f}%'], 
                                      autopct='', startangle=90, 
                                      colors=[colors_pie[0] if fertility_score < 50 else colors_pie[1] if fertility_score < 75 else colors_pie[2]])
    ax3.set_title('Fertility Assessment', fontweight='bold')
    
    # Environmental factors
    env_data = {
        'Temperature': soil_features['temperature'],
        'Moisture': soil_features['moisture'],
        'Organic Matter': soil_features['organic_matter'],
        'EC': soil_features['ec']
    }
    
    ax4.barh(list(env_data.keys()), list(env_data.values()), 
             color=['#FF9999', '#66B2FF', '#99FF99', '#FFCC99'])
    ax4.set_title('Environmental Factors', fontweight='bold')
    ax4.set_xlabel('Values (°C, %, dS/m)')
    
    plt.tight_layout()
    
    chart_path = os.path.join(os.environ.get('REPORTS_DIR', './reports'), f'{report_id}_charts.png')
    plt.savefig(chart_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    return chart_path

def generate_pdf_report(report_data, report_id):
    """Generate PDF report"""
    
    reports_dir = os.environ.get('REPORTS_DIR', './reports')
    pdf_path = os.path.join(reports_dir, f'{report_id}.pdf')
    
    # Generate charts first
    chart_path = generate_charts(report_data, report_id)
    
    doc = SimpleDocTemplate(pdf_path, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1,  # Center
        textColor=colors.HexColor('#2E86AB')
    )
    story.append(Paragraph("Soil Fertility Analysis Report", title_style))
    story.append(Spacer(1, 20))
    
    # Report info
    report_info = [
        ['Report ID:', report_id],
        ['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
        ['Fertility Level:', report_data['prediction'].get('fertility_level', 'Unknown')],
        ['Fertility Score:', f"{report_data['prediction'].get('fertility_score', 0) * 100:.1f}%"]
    ]
    
    if report_data.get('location'):
        loc = report_data['location']
        report_info.append(['Location:', f"Lat: {loc['lat']:.4f}, Lon: {loc['lon']:.4f}"])
    
    info_table = Table(report_info, colWidths=[2*inch, 3*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8F4FD')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))
    
    # Soil parameters table
    story.append(Paragraph("Soil Parameters", styles['Heading2']))
    soil_data = [
        ['Parameter', 'Value', 'Unit', 'Status'],
        ['pH Level', f"{report_data['soil_features']['ph']:.1f}", '-', 'Acidic' if report_data['soil_features']['ph'] < 6.5 else 'Neutral' if report_data['soil_features']['ph'] < 7.5 else 'Alkaline'],
        ['Nitrogen (N)', f"{report_data['soil_features']['nitrogen']:.1f}", 'ppm', 'Good' if report_data['soil_features']['nitrogen'] > 40 else 'Low'],
        ['Phosphorus (P)', f"{report_data['soil_features']['phosphorus']:.1f}", 'ppm', 'Good' if report_data['soil_features']['phosphorus'] > 15 else 'Low'],
        ['Potassium (K)', f"{report_data['soil_features']['potassium']:.1f}", 'ppm', 'Good' if report_data['soil_features']['potassium'] > 100 else 'Low'],
        ['Organic Matter', f"{report_data['soil_features']['organic_matter']:.1f}", '%', 'Good' if report_data['soil_features']['organic_matter'] > 2.5 else 'Low'],
        ['Moisture', f"{report_data['soil_features']['moisture']:.1f}", '%', 'Optimal'],
        ['Temperature', f"{report_data['soil_features']['temperature']:.1f}", '°C', 'Good'],
        ['EC', f"{report_data['soil_features']['ec']:.2f}", 'dS/m', 'Normal' if report_data['soil_features']['ec'] < 2.0 else 'High']
    ]
    
    soil_table = Table(soil_data, colWidths=[1.5*inch, 1*inch, 0.8*inch, 1*inch])
    soil_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E86AB')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8F9FA')])
    ]))
    story.append(soil_table)
    story.append(Spacer(1, 20))
    
    # Charts
    if os.path.exists(chart_path):
        story.append(Paragraph("Visual Analysis", styles['Heading2']))
        story.append(Image(chart_path, width=6*inch, height=5*inch))
        story.append(Spacer(1, 20))
    
    # Recommendations
    story.append(Paragraph("Fertilizer Recommendations", styles['Heading2']))
    
    fertilizers = report_data['prediction'].get('fertilizer_recommendations', [])
    if fertilizers:
        for i, fert in enumerate(fertilizers[:5]):  # Limit to top 5
            story.append(Paragraph(f"<b>{i+1}. {fert['name']}</b>", styles['Normal']))
            story.append(Paragraph(f"Dosage: {fert['dose_kg_per_hectare']} kg/hectare", styles['Normal']))
            story.append(Paragraph(f"{fert['explanation']}", styles['Normal']))
            story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("No additional fertilizers recommended. Your soil is well-balanced!", styles['Normal']))
    
    story.append(Spacer(1, 20))
    
    # Crop recommendations
    story.append(Paragraph("Recommended Crops", styles['Heading2']))
    crops = report_data['prediction'].get('crop_recommendations', [])
    if crops:
        for i, crop in enumerate(crops[:3]):  # Limit to top 3
            story.append(Paragraph(f"<b>{i+1}. {crop['crop']}</b>", styles['Normal']))
            story.append(Paragraph(f"{crop['reason']}", styles['Normal']))
            if crop.get('expected_yield_t_ha', 0) > 0:
                story.append(Paragraph(f"Expected yield: {crop['expected_yield_t_ha']:.1f} tonnes/hectare", styles['Normal']))
            story.append(Spacer(1, 10))
    
    # Build PDF
    doc.build(story)
    
    return pdf_path

def generate_csv_report(report_data, report_id):
    """Generate CSV report"""
    
    reports_dir = os.environ.get('REPORTS_DIR', './reports')
    csv_path = os.path.join(reports_dir, f'{report_id}.csv')
    
    # Prepare data for CSV
    data = []
    
    # Basic info
    data.append(['Report Information', '', '', ''])
    data.append(['Report ID', report_id, '', ''])
    data.append(['Generated', datetime.now().strftime('%Y-%m-%d %H:%M:%S'), '', ''])
    data.append(['Fertility Level', report_data['prediction'].get('fertility_level', 'Unknown'), '', ''])
    data.append(['Fertility Score', f"{report_data['prediction'].get('fertility_score', 0) * 100:.1f}%", '', ''])
    data.append(['', '', '', ''])
    
    # Soil parameters
    data.append(['Soil Parameters', 'Value', 'Unit', 'Notes'])
    soil_features = report_data['soil_features']
    data.append(['pH Level', f"{soil_features['ph']:.2f}", '-', '6.0-7.0 optimal'])
    data.append(['Nitrogen (N)', f"{soil_features['nitrogen']:.1f}", 'ppm', 'Primary nutrient'])
    data.append(['Phosphorus (P)', f"{soil_features['phosphorus']:.1f}", 'ppm', 'Root development'])
    data.append(['Potassium (K)', f"{soil_features['potassium']:.1f}", 'ppm', 'Disease resistance'])
    data.append(['Organic Matter', f"{soil_features['organic_matter']:.2f}", '%', '2-4% good range'])
    data.append(['Moisture Content', f"{soil_features['moisture']:.1f}", '%', 'Water holding capacity'])
    data.append(['Soil Temperature', f"{soil_features['temperature']:.1f}", '°C', 'Affects nutrient availability'])
    data.append(['Electrical Conductivity', f"{soil_features['ec']:.2f}", 'dS/m', 'Salinity indicator'])
    data.append(['', '', '', ''])
    
    # Fertilizer recommendations
    data.append(['Fertilizer Recommendations', '', '', ''])
    data.append(['Fertilizer Name', 'Dosage (kg/ha)', 'Explanation', ''])
    fertilizers = report_data['prediction'].get('fertilizer_recommendations', [])
    for fert in fertilizers:
        data.append([fert['name'], f"{fert['dose_kg_per_hectare']:.1f}", fert['explanation'], ''])
    data.append(['', '', '', ''])
    
    # Crop recommendations
    data.append(['Crop Recommendations', '', '', ''])
    data.append(['Crop Name', 'Expected Yield (t/ha)', 'Reason', ''])
    crops = report_data['prediction'].get('crop_recommendations', [])
    for crop in crops:
        yield_str = f"{crop.get('expected_yield_t_ha', 0):.1f}" if crop.get('expected_yield_t_ha', 0) > 0 else 'N/A'
        data.append([crop['crop'], yield_str, crop['reason'], ''])
    
    # Create DataFrame and save
    df = pd.DataFrame(data)
    df.to_csv(csv_path, index=False, header=False)
    
    return csv_path

def main():
    """Main function"""
    try:
        report_data = read_input()
        report_id = report_data['reportId']
        
        # Generate both PDF and CSV
        pdf_path = generate_pdf_report(report_data, report_id)
        csv_path = generate_csv_report(report_data, report_id)
        
        # Save metadata
        reports_dir = os.environ.get('REPORTS_DIR', './reports')
        metadata_path = os.path.join(reports_dir, f'{report_id}.json')
        with open(metadata_path, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        # Return success
        result = {
            'success': True,
            'report_id': report_id,
            'pdf_path': pdf_path,
            'csv_path': csv_path,
            'metadata_path': metadata_path
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()