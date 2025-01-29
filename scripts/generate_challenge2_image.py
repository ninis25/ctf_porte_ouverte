from PIL import Image, ImageDraw, ImageFont
import piexif
import os
from datetime import datetime

def create_challenge_image():
    # Obtenir le chemin absolu du projet
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_dir = os.path.join(project_root, 'public', 'images')
    
    # Créer une image simple
    width = 800
    height = 400
    image = Image.new('RGB', (width, height), color=(37, 99, 235))  # Bleu
    draw = ImageDraw.Draw(image)
    
    # Texte simple
    text = "Challenge #2\nStéganographie"
    font = ImageFont.load_default()
    
    # Centrer le texte
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Dessiner le texte
    draw.text((x, y), text, fill='white', font=font)
    
    try:
        # Créer le dossier de sortie si nécessaire
        os.makedirs(output_dir, exist_ok=True)
        
        # Chemin de sortie
        output_path = os.path.join(output_dir, 'challenge2.jpg')
        
        # Sauvegarder d'abord l'image sans EXIF
        image.save(output_path, "JPEG", quality=95)
        
        # Ajouter les métadonnées EXIF
        exif_dict = {
            "0th": {
                piexif.ImageIFD.Make: "IUT R&T".encode('utf-8'),
                piexif.ImageIFD.Software: "CTF Creator 1.0".encode('utf-8'),
            },
            "Exif": {
                piexif.ExifIFD.UserComment: "FLAG{IMAGE_SECRETE}".encode('utf-8')
            }
        }
        
        # Insérer les métadonnées EXIF
        exif_bytes = piexif.dump(exif_dict)
        piexif.insert(exif_bytes, output_path)
        
        print(f"Image générée avec succès dans: {output_path}")
        
    except Exception as e:
        print(f"Erreur lors de la génération de l'image: {str(e)}")
        raise e

if __name__ == "__main__":
    create_challenge_image() 