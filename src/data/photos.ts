import blickkontakt from '../assets/images/autumn/blickkontakt.jpg';
import standGegenlicht from '../assets/images/autumn/stand-gegenlicht.jpg';
import standSonne from '../assets/images/autumn/stand-sonne.jpg';
import nahportraet from '../assets/images/autumn/nahportraet.jpg';
import bewegung from '../assets/images/autumn/bewegung.jpg';
import alltagStock from '../assets/images/autumn/alltag-stock.jpg';
import ruhe from '../assets/images/autumn/ruhe.jpg';
import sitzprofil from '../assets/images/autumn/sitzprofil.jpg';
import aufmerksam from '../assets/images/autumn/aufmerksam.jpg';
import spielpause from '../assets/images/autumn/spielpause.jpg';
import kleinePfote from '../assets/images/autumn/kleine-pfote.jpg';
import frontalImGras from '../assets/images/autumn/frontal-im-gras.jpg';
import kopfprofilSonne from '../assets/images/autumn/kopfprofil-sonne.jpg';
import seitenstand from '../assets/images/autumn/seitenstand.jpg';
import sitzendeSilhouette from '../assets/images/autumn/sitzende-silhouette.jpg';
import froehlicherBlick from '../assets/images/autumn/froehlicher-blick.jpg';
import spielNahaufnahme from '../assets/images/autumn/spiel-nahaufnahme.jpg';
import talblick from '../assets/images/autumn/talblick.jpg';
import talblickQuer from '../assets/images/autumn/talblick-quer.jpg';

export const photos = {
  blickkontakt: { image: blickkontakt, title: 'Ein wacher Blick', alt: 'Sir Ludwig liegt im Herbstgras und blickt direkt in die Kamera' },
  standGegenlicht: { image: standGegenlicht, title: 'Im Abendlicht', alt: 'Sir Ludwig steht seitlich auf einer Wiese im warmen Gegenlicht' },
  standSonne: { image: standSonne, title: 'Apricot und Weiß', alt: 'Sir Ludwig im seitlichen Stand mit sonnenbeschienenem apricotweißem Fell' },
  nahportraet: { image: nahportraet, title: 'Ganz aufmerksam', alt: 'Nahporträt von Sir Ludwig zwischen Grashalmen, den Blick zur Seite gerichtet' },
  bewegung: { image: bewegung, title: 'In Bewegung', alt: 'Sir Ludwig läuft mit fliegenden Ohren auf die Kamera zu' },
  alltagStock: { image: alltagStock, title: 'Ein guter Fund', alt: 'Sir Ludwig liegt auf einem Waldweg und hält einen Stock im Maul' },
  ruhe: { image: ruhe, title: 'Ein Moment Ruhe', alt: 'Sir Ludwig ruht auf einem steinigen Weg und schaut aufmerksam zur Seite' },
  sitzprofil: { image: sitzprofil, title: 'Im Herbstlicht', alt: 'Sir Ludwig sitzt im Profil auf einer herbstlichen Wiese im Gegenlicht' },
  aufmerksam: { image: aufmerksam, title: 'Draußen zu Hause', alt: 'Sir Ludwig sitzt aufrecht im hohen Gras vor herbstlichen Bäumen' },
  spielpause: { image: spielpause, title: 'Zeit zum Spielen', alt: 'Sir Ludwig beugt sich spielerisch mit einem Stock zwischen den Vorderpfoten nach vorn' },
  kleinePfote: { image: kleinePfote, title: 'Eine kleine Geste', alt: 'Sir Ludwig sitzt im Gegenlicht und hebt eine Vorderpfote' },
  frontalImGras: { image: frontalImGras, title: 'Im hohen Gras', alt: 'Sir Ludwig sitzt frontal im hohen Herbstgras' },
  kopfprofilSonne: { image: kopfprofilSonne, title: 'Ein Blick zur Seite', alt: 'Sir Ludwig schaut mit leicht geöffnetem Maul zur Seite, die Sonne beleuchtet sein Kopfprofil' },
  seitenstand: { image: seitenstand, title: 'Im Profil', alt: 'Sir Ludwig steht vollständig von der Seite im Herbstgras, mit sichtbarer Rute und Pfoten' },
  sitzendeSilhouette: { image: sitzendeSilhouette, title: 'Aufrecht und aufmerksam', alt: 'Sir Ludwig sitzt aufrecht im Gras, sein Körper im seitlichen Dreiviertelprofil' },
  froehlicherBlick: { image: froehlicherBlick, title: 'Ein freundlicher Blick', alt: 'Sir Ludwig liegt im Gras und schaut mit geöffnetem Maul freundlich in die Kamera' },
  spielNahaufnahme: { image: spielNahaufnahme, title: 'Mittendrin', alt: 'Sir Ludwig spielt bodennah mit einem Stock, Kopf und Vorderpfoten nah an der Kamera' },
  talblick: { image: talblick, title: 'Eine Pause im Tal', alt: 'Sir Ludwig liegt auf einem Weg vor einem herbstlich bewaldeten Hang' },
  talblickQuer: { image: talblickQuer, title: 'Eine Pause im Tal', alt: 'Sir Ludwig liegt auf einem Weg vor einem herbstlich bewaldeten Hang' },
};
export const gallerySections = [
  { id: 'portraits', title: 'Porträts & Ausdruck', date: 'Oktober 2026', photos: [photos.blickkontakt, photos.nahportraet,
    photos.sitzprofil, photos.kleinePfote, photos.frontalImGras, photos.kopfprofilSonne, photos.froehlicherBlick] },
  { id: 'appearance', title: 'Typ & Erscheinung', date: 'Oktober 2026', photos: [photos.seitenstand,
    photos.standGegenlicht, photos.sitzendeSilhouette, photos.aufmerksam, photos.standSonne] },
  { id: 'everyday', title: 'Spiel & Alltag', date: 'Oktober 2026', photos: [photos.bewegung, photos.spielpause, photos.spielNahaufnahme,
    photos.alltagStock, photos.ruhe, photos.talblick] },
];
export const galleryPhotos = gallerySections.flatMap((section) => section.photos);
