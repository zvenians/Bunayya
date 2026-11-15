from pathlib import Path
import json
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "assets/content.json").read_text(encoding="utf-8"))
OUT = ROOT / "brochures"
BLUE, DEEP, GOLD, IVORY, INK = colors.HexColor("#0B3D63"), colors.HexColor("#062A46"), colors.HexColor("#B99545"), colors.HexColor("#F6F2E8"), colors.HexColor("#14242D")
font_path = Path("C:/Windows/Fonts/arial.ttf")
bold_path = Path("C:/Windows/Fonts/arialbd.ttf")
if font_path.exists():
    pdfmetrics.registerFont(TTFont("Bunayya", str(font_path)))
    pdfmetrics.registerFont(TTFont("BunayyaBold", str(bold_path)))
    FONT, BOLD = "Bunayya", "BunayyaBold"
else:
    FONT, BOLD = "Helvetica", "Helvetica-Bold"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleB", fontName=BOLD, fontSize=29, leading=33, textColor=DEEP, spaceAfter=10))
styles.add(ParagraphStyle(name="KickerB", fontName=BOLD, fontSize=8, leading=10, tracking=2, textColor=GOLD, spaceAfter=9))
styles.add(ParagraphStyle(name="H2B", fontName=BOLD, fontSize=17, leading=21, textColor=BLUE, spaceBefore=8, spaceAfter=8))
styles.add(ParagraphStyle(name="BodyB", fontName=FONT, fontSize=9.2, leading=14, textColor=INK, spaceAfter=7))
styles.add(ParagraphStyle(name="SmallB", fontName=FONT, fontSize=7.4, leading=10.5, textColor=colors.HexColor("#53636C")))
styles.add(ParagraphStyle(name="CoverB", fontName=BOLD, fontSize=34, leading=38, alignment=TA_CENTER, textColor=colors.white))

def rupiah(n): return "Rp {:,}".format(n).replace(",", ".")
def header_footer(canvas, doc):
    canvas.saveState(); canvas.setFillColor(BLUE); canvas.rect(0, A4[1]-13*mm, A4[0], 13*mm, fill=1, stroke=0)
    canvas.setFont(BOLD, 8); canvas.setFillColor(colors.white); canvas.drawString(18*mm, A4[1]-8.5*mm, "BUNAYYA  |  KB-TK ISLAM TERPADU")
    canvas.setFont(FONT, 7); canvas.setFillColor(colors.HexColor("#708089")); canvas.drawString(18*mm, 10*mm, "Informasi resmi BUNAYYA I & II  -  PPDB 2027/2028")
    canvas.drawRightString(A4[0]-18*mm, 10*mm, str(doc.page)); canvas.restoreState()

def doc(path): return SimpleDocTemplate(str(path), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=24*mm, bottomMargin=18*mm, title="BUNAYYA 2027/2028", author="KB-TK IT BUNAYYA I & II")
def logo(width=34*mm):
    im=Image(str(ROOT/"assets/logo-bunayya.png"), width=width, height=width); im.hAlign="CENTER"; return im
def cover(title, subtitle):
    data=[[logo(31*mm)],[Spacer(1,8*mm)],[Paragraph(title,styles["CoverB"])],[Paragraph(subtitle,ParagraphStyle("cs",parent=styles["BodyB"],alignment=TA_CENTER,textColor=colors.HexColor("#D7E5EC"),fontSize=11))]]
    t=Table(data,colWidths=[174*mm],rowHeights=[42*mm,8*mm,40*mm,25*mm]); t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),DEEP),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("TOPPADDING",(0,0),(-1,-1),8*mm),("BOTTOMPADDING",(0,0),(-1,-1),8*mm)])); return [t,PageBreak()]
def profile_story():
    flow=[Paragraph("PROFIL SEKOLAH",styles["KickerB"]),Paragraph("Tumbuh dalam iman.<br/>Belajar dengan gembira.",styles["TitleB"]),Paragraph("BUNAYYA memadukan Kurikulum Merdeka dengan pendidikan agama Islam melalui sistem belajar sentra, untuk membentuk karakter sholeh, mandiri, cerdas, terampil, dan bertanggung jawab.",styles["BodyB"]),Spacer(1,4*mm),Paragraph("VISI",styles["H2B"]),Paragraph("Menjadi SEKOLAH UNGGUL HARAPAN UMMAT dalam mendidik siswa, cinta Al Quran, cerdas berprestasi, berakhlak mulia, sebagai pemimpin masa depan berwawasan kebangsaan.",styles["BodyB"]),Paragraph("MISI",styles["H2B"])]
    missions=["Mendidik Siswa Cerdas Berprestasi Berakhlak Mulia Sebagai Pemimpin Masa Depan Yang Berwawasan Kebangsaan.","Mewujudkan Pilar Keunggulan Sekolah Islam Terpadu Bunayya.","Mengembangkan Sekolah Islam Terpadu Bunayya Sebagai Pusat Pembelajaran."]
    flow += [Paragraph(f"{i+1}. {x}",styles["BodyB"]) for i,x in enumerate(missions)]
    flow += [Paragraph("PROGRAM PEMBELAJARAN",styles["H2B"]),Paragraph("Agama Islam & Al-Quran: Tahsin metode Yanbu'a, hafalan surat pendek Juz 30, hadits dan doa sehari-hari, siroh nabi dan rasul, Asmaul Husna, dan praktik ibadah.",styles["BodyB"]),Paragraph("Tujuh sentra: balok, bermain peran, seni rupa, gerak & lagu, bahan alam, persiapan membaca, dan persiapan berhitung.",styles["BodyB"]),Paragraph("PROGRAM PEMEKARYA",styles["H2B"]),Paragraph("Wisata Tema; Pendidikan Olahraga Kreatif; Life Skill; Science; dan Pemutaran Film Pendidikan.",styles["BodyB"]),Paragraph("KEGIATAN SEKOLAH",styles["H2B"]),Paragraph("Outdoor: renang, kunjungan tema, outbound, dan manasik haji untuk TK B.<br/>Indoor: PHBI dan PHBN, pemeriksaan kesehatan, menu sehat, pesantren kilat Ramadan, wisuda Qur'an, dan pentas seni.<br/>Kegiatan orang tua: bimbingan membaca Al-Qur'an, parenting, dan pengajian rutin ISTIWA.",styles["BodyB"]),Paragraph("KAMPUS",styles["H2B"])]
    for c in DATA["campuses"]: flow += [Paragraph(f"<b>{c['name']}</b><br/>{c['address']}",styles["BodyB"])]
    return flow
def fees_story():
    t=DATA["tuition"]; flow=[Paragraph("BIAYA PENDIDIKAN",styles["KickerB"]),Paragraph("PPDB 2027/2028",styles["TitleB"]),Paragraph("Rincian biaya awal. Komponen bulanan ditampilkan satu kali untuk bulan Juli 2027; tidak dihitung berulang dalam jumlah awal.",styles["BodyB"])]
    for level,rows in t["levels"].items():
        body=[[Paragraph(f"<b>{level}</b>",styles["BodyB"]),Paragraph("Nominal",styles["BodyB"])]]+[[Paragraph(r["label"],styles["SmallB"]),Paragraph(rupiah(r["amount"]),styles["SmallB"])] for r in rows]+[[Paragraph("<b>TOTAL NORMAL</b>",styles["BodyB"]),Paragraph(f"<b>{rupiah(t['officialTotals'][level])}</b>",styles["BodyB"])]]
        tab=Table(body,colWidths=[112*mm,50*mm]); tab.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),IVORY),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#CAD4D8")),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("PADDING",(0,0),(-1,-1),5)])); flow += [Spacer(1,4*mm),KeepTogether([tab])]
    flow += [PageBreak(),Paragraph("JUMLAH SETELAH POTONGAN",styles["H2B"])]
    payment=[["Periode","KB","TK A","TK B"]]
    for p in t["periods"]: payment.append([p["label"]]+[rupiah(t["officialTotals"][level]-p["discount"]) for level in ["KB","TK A","TK B"]])
    payment_tab=Table(payment,colWidths=[60*mm,34*mm,34*mm,34*mm]); payment_tab.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),BLUE),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,-1),FONT),("FONTNAME",(0,0),(-1,0),BOLD),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#CAD4D8")),("PADDING",(0,0),(-1,-1),6)])); flow += [payment_tab,Spacer(1,5*mm),Paragraph("POTONGAN PERIODE",styles["H2B"])]
    disc=[["Periode pelunasan","Potongan"]]+[[p["label"],rupiah(p["discount"])] for p in t["periods"]]
    tab=Table(disc,colWidths=[112*mm,50*mm]); tab.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),BLUE),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,-1),FONT),("FONTNAME",(0,0),(-1,0),BOLD),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#CAD4D8")),("PADDING",(0,0),(-1,-1),7)])); flow += [tab,Spacer(1,5*mm),Paragraph("SYARAT DAN KEBIJAKAN",styles["H2B"])]
    flow += [Paragraph(p,styles["SmallB"]) for p in t["policies"]]
    return flow
def build_pdf(path, title, subtitle, sections):
    d=doc(path); d.build(cover(title,subtitle)+sections,onFirstPage=header_footer,onLaterPages=header_footer)

OUT.mkdir(exist_ok=True)
build_pdf(OUT/"profil-bunayya.pdf","PROFIL BUNAYYA","KB-TK Islam Terpadu BUNAYYA I & II",profile_story())
build_pdf(OUT/"biaya-pendidikan-2027-2028.pdf","BIAYA PENDIDIKAN","Tahun Ajaran 2027/2028",fees_story())
build_pdf(OUT/"paket-lengkap-bunayya.pdf","PAKET INFORMASI LENGKAP","Profil sekolah dan biaya pendidikan 2027/2028",profile_story()+[PageBreak()]+fees_story())
print("Generated 3 brochures from assets/content.json")
