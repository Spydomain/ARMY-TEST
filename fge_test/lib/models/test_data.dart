import 'dart:math';
import './question.dart';

List<Question> getQuestionsForCategory(String categoryId, int count, String mode, {List<String> answeredQuestions = const []}) {
  List<Question> allQuestions; 

  if (categoryId == 'mixed') {
    allQuestions = _allQuestions;
  } else {
    allQuestions = _allQuestions.where((q) => q.category == categoryId).toList();
  }

  if (allQuestions.isEmpty) {
    return [];
  }

  List<Question> availableQuestions = allQuestions.where((q) => !answeredQuestions.contains(q.id)).toList();

  if (availableQuestions.length < count) {
    availableQuestions.addAll(allQuestions);
  }

  final random = Random();
  final List<Question> shuffledQuestions = List.from(availableQuestions)..shuffle(random);

  final selectedQuestions = shuffledQuestions.take(count).toList();

  return selectedQuestions.map((q) => _shuffleQuestionOptions(q, random)).toList();
}

Question _shuffleQuestionOptions(Question question, Random random) {
  final enOptions = question.options!['en']!;
  final frOptions = question.options!['fr']!;
  final correctAnswerEn = enOptions[question.correctAnswerIndex];

  var combined = List.generate(enOptions.length, (i) => [enOptions[i], frOptions[i]]);
  combined.shuffle(random);

  final shuffledEnOptions = combined.map((pair) => pair[0]).toList();
  final shuffledFrOptions = combined.map((pair) => pair[1]).toList();
  final newCorrectAnswerIndex = shuffledEnOptions.indexOf(correctAnswerEn);

  final newOptions = {
    'en': shuffledEnOptions,
    'fr': shuffledFrOptions,
  };

  return Question(
    id: question.id,
    category: question.category,
    image: question.image,
    title: question.title,
    options: newOptions,
    correctAnswerIndex: newCorrectAnswerIndex,
    correctAnswer: question.correctAnswer,
    description: question.description,
  );
}

final List<Question> _allQuestions = [
  // Category: Tanks
  Question(
    id: 'tank_1',
    category: 'tanks',
    image: 'assets/images/T_90.png',
    title: {'en': 'What tank is this?', 'fr': 'Quel char est-ce ?'},
    options: {'en': ['T-90', 'T-80', 'T-72', 'T-64'], 'fr': ['T-90', 'T-80', 'T-72', 'T-64']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'T-90', 'fr': 'T-90'},
    description: {'en': 'The T-90 is a Russian third-generation main battle tank.', 'fr': 'Le T-90 est un char de combat principal russe de troisième génération.'},
  ),
  Question(
    id: 'tank_2',
    category: 'tanks',
    image: 'assets/images/T_80.png',
    title: {'en': 'Identify the tank in the image.', 'fr': 'Identifiez le char dans l\'image.'},
    options: {'en': ['T-80', 'Leopard 2', 'M1 Abrams', 'Challenger 2'], 'fr': ['T-80', 'Leopard 2', 'M1 Abrams', 'Challenger 2']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'T-80', 'fr': 'T-80'},
    description: {'en': 'The T-80 is a main battle tank that was designed and manufactured in the Soviet Union.', 'fr': 'Le T-80 est un char de combat principal conçu et fabriqué en Union soviétique.'},
  ),
  Question(
    id: 'tank_3',
    category: 'tanks',
    image: 'assets/images/T_72.png',
    title: {'en': 'What is the main armament of the T-72 tank?', 'fr': 'Quel est l\'armement principal du char T-72 ?'},
    options: {'en': ['125mm smoothbore gun', '120mm rifled cannon', '105mm rifled gun', '100mm rifled gun'], 'fr': ['Canon à âme lisse de 125 mm', 'Canon rayé de 120 mm', 'Canon rayé de 105 mm', 'Canon rayé de 100 mm']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': '125mm smoothbore gun', 'fr': 'Canon à âme lisse de 125 mm'},
    description: {'en': 'The T-72 is armed with a 125 mm 2A46 series main gun, a significant increase in firepower over its predecessors.', 'fr': 'Le T-72 est armé d\'un canon principal de 125 mm de la série 2A46, une augmentation significative de la puissance de feu par rapport à ses prédécesseurs.'},
  ),
  Question(
    id: 'tank_4',
    category: 'tanks',
    image: 'assets/images/T_64.png',
    title: {'en': 'This tank was first introduced in which decade?', 'fr': 'Ce char a été introduit pour la première fois dans quelle décennie ?'},
    options: {'en': ['1960s', '1970s', '1980s', '1950s'], 'fr': ['Années 1960', 'Années 1970', 'Années 1980', 'Années 1950']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': '1960s', 'fr': 'Années 1960'},
    description: {'en': 'The T-64 was a Soviet second-generation main battle tank introduced in the early 1960s.', 'fr': 'Le T-64 était un char de combat principal soviétique de deuxième génération introduit au début des années 1960.'},
  ),
  Question(
    id: 'tank_5',
    category: 'tanks',
    image: 'assets/images/T_62.png',
    title: {'en': 'What tank is shown in the image?', 'fr': 'Quel char est montré dans l\'image ?'},
    options: {'en': ['T-62', 'T-55', 'T-54', 'T-72'], 'fr': ['T-62', 'T-55', 'T-54', 'T-72']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'T-62', 'fr': 'T-62'},
    description: {'en': 'The T-62 is a Soviet main battle tank that was first introduced in 1961.', 'fr': 'Le T-62 est un char de combat principal soviétique qui a été introduit pour la première fois en 1961.'},
  ),
  Question(
    id: 'tank_6',
    category: 'tanks',
    image: 'assets/images/T_54_55.png',
    title: {'en': 'The T-54/55 series is the most-produced tank in history. True or False?', 'fr': 'La série T-54/55 est le char le plus produit de l\'histoire. Vrai ou faux?'},
    options: {'en': ['True', 'False'], 'fr': ['Vrai', 'Faux']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'True', 'fr': 'Vrai'},
    description: {'en': 'The T-54/55 series is the most-produced tank in history. Estimated production numbers for the series range from 86,000 to 100,000.', 'fr': 'La série T-54/55 est le char le plus produit de l\'histoire. Les estimations de production pour la série varient de 86 000 à 100 000.'},
  ),
   Question(
    id: 'tank_7',
    category: 'tanks',
    image: 'assets/images/BRDM_2.png',
    title: {'en': 'Identify the vehicle in the image.', 'fr': 'Identifiez le véhicule dans l\'image.'},
    options: {'en': ['BRDM-2', 'BTR-60', 'BMP-1', 'T-62'], 'fr': ['BRDM-2', 'BTR-60', 'BMP-1', 'T-62']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'BRDM-2', 'fr': 'BRDM-2'},
    description: {'en': 'The BRDM-2 is a patrol car, not a tank. It is amphibious and has a crew of four.', 'fr': 'Le BRDM-2 est une voiture de patrouille, pas un char. Il est amphibie et a un équipage de quatre personnes.'},
  ),
    Question(
    id: 'tank_8',
    category: 'tanks',
    image: 'assets/images/T_90.png',
    title: {'en': 'What is the main difference between the T-90 and T-72?', 'fr': 'Quelle est la principale différence entre le T-90 et le T-72 ?'},
    options: {'en': ['Fire control system', 'Main armament', 'Engine type', 'Armor thickness'], 'fr': ['Système de conduite de tir', 'Armement principal', 'Type de moteur', 'Épaisseur du blindage']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'Fire control system', 'fr': 'Système de conduite de tir'},
    description: {'en': 'The T-90 has a more advanced fire control system than the T-72, including thermal sights for the gunner and commander.', 'fr': 'Le T-90 dispose d\'un système de conduite de tir plus avancé que le T-72, y compris des viseurs thermiques pour le tireur et le commandant.'},
  ),

  // Category: APCs
  Question(
    id: 'apc_1',
    category: 'apcs',
    image: 'assets/images/BMP_3.png',
    title: {'en': 'Identify this vehicle.', 'fr': 'Identifiez ce véhicule.'},
    options: {'en': ['BMP-3', 'BMP-2', 'BMP-1', 'BMD-3'], 'fr': ['BMP-3', 'BMP-2', 'BMP-1', 'BMD-3']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'BMP-3', 'fr': 'BMP-3'},
    description: {'en': 'The BMP-3 is a Soviet and Russian infantry fighting vehicle.', 'fr': 'Le BMP-3 est un véhicule de combat d\'infanterie soviétique et russe.'},
  ),
  Question(
    id: 'apc_2',
    category: 'apcs',
    image: 'assets/images/BTR_80_A.png',
    title: {'en': 'What is this vehicle?', 'fr': 'Quel est ce véhicule ?'},
    options: {'en': ['BTR-80A', 'BTR-80', 'BTR-70', 'BTR-60'], 'fr': ['BTR-80A', 'BTR-80', 'BTR-70', 'BTR-60']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'BTR-80A', 'fr': 'BTR-80A'},
    description: {'en': 'This is a BTR-80A, an upgraded version of the BTR-80 with a 30mm autocannon.', 'fr': 'Ceci est un BTR-80A, une version améliorée du BTR-80 avec un canon automatique de 30 mm.'},
  ),
  Question(
    id: 'apc_3',
    category: 'apcs',
    image: 'assets/images/BMD_1.png',
    title: {'en': 'What does BMD stand for?', 'fr': 'Que signifie BMD ?'},
    options: {'en': ['Airborne Combat Vehicle', 'Infantry Fighting Vehicle', 'Armored Personnel Carrier', 'Battle Management Device'], 'fr': ['Véhicule de combat aéroporté', 'Véhicule de combat d\'infanterie', 'Transport de troupes blindé', 'Dispositif de gestion de bataille']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'Airborne Combat Vehicle', 'fr': 'Véhicule de combat aéroporté'},
    description: {'en': 'BMD stands for Boyevaya Mashina Desanta, which translates to "Airborne Combat Vehicle".', 'fr': 'BMD signifie Boyevaya Mashina Desanta, ce qui se traduit par "Véhicule de combat aéroporté".'},
  ),
  Question(
    id: 'apc_4',
    category: 'apcs',
    image: 'assets/images/BMP_2.png',
    title: {'en': 'Identify the vehicle in the image.', 'fr': 'Identifiez le véhicule dans l\'image.'},
    options: {'en': ['BMP-2', 'BMP-1', 'BTR-80', 'MT-LB'], 'fr': ['BMP-2', 'BMP-1', 'BTR-80', 'MT-LB']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'BMP-2', 'fr': 'BMP-2'},
    description: {'en': 'The BMP-2 is a second-generation, amphibious infantry fighting vehicle introduced in the 1980s.', 'fr': 'Le BMP-2 est un véhicule de combat d\'infanterie amphibie de deuxième génération introduit dans les années 1980.'},
  ),
    Question(
    id: 'apc_5',
    category: 'apcs',
    image: 'assets/images/BMD_2.png',
    title: {'en': 'What is the primary role of the BMD-2?', 'fr': 'Quel est le rôle principal du BMD-2 ?'},
    options: {'en': ['Airborne infantry support', 'Main battle tank', 'Anti-aircraft defense', 'Reconnaissance'], 'fr': ['Soutien d\'infanterie aéroportée', 'Char de combat principal', 'Défense anti-aérienne', 'Reconnaissance']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'Airborne infantry support', 'fr': 'Soutien d\'infanterie aéroportée'},
    description: {'en': 'The BMD-2 is an airborne infantry fighting vehicle, designed to be dropped by parachute to support airborne troops.', 'fr': 'Le BMD-2 est un véhicule de combat d\'infanterie aéroporté, conçu pour être parachuté afin de soutenir les troupes aéroportées.'},
  ),
    Question(
    id: 'apc_6',
    category: 'apcs',
    image: 'assets/images/BMP_3.png',
    title: {'en': 'What is the purpose of the snorkel on the BMP-3?', 'fr': 'À quoi sert le schnorchel sur le BMP-3 ?'},
    options: {'en': ['Amphibious operations', 'Engine cooling', 'Dust filtration', 'Deep wading'], 'fr': ['Opérations amphibies', 'Refroidissement du moteur', 'Filtration de la poussière', 'Passage à gué profond']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'Amphibious operations', 'fr': 'Opérations amphibies'},
    description: {'en': 'The snorkel allows the BMP-3 to travel through water, making it fully amphibious.', 'fr': 'Le schnorchel permet au BMP-3 de se déplacer dans l\'eau, le rendant entièrement amphibie.'},
  ),

  // Category: Helicopters
  Question(
    id: 'helicopter_1',
    category: 'helicopters',
    image: 'assets/images/Mi-24.png',
    title: {'en': 'What is the nickname of this helicopter?', 'fr': 'Quel est le surnom de cet hélicoptère ?'},
    options: {'en': ['Hind', 'Havoc', 'Hip', 'Halo'], 'fr': ['Hind', 'Havoc', 'Hip', 'Halo']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'Hind', 'fr': 'Hind'},
    description: {'en': 'The Mi-24 is known by its NATO reporting name, "Hind".', 'fr': 'Le Mi-24 est connu sous son nom de rapport de l\'OTAN, "Hind".'},
  ),
  Question(
    id: 'helicopter_2',
    category: 'helicopters',
    image: 'assets/images/Mi-28.png',
    title: {'en': 'Identify this helicopter.', 'fr': 'Identifiez cet hélicoptère.'},
    options: {'en': ['Mi-28', 'Ka-52', 'AH-64 Apache', 'Mi-24'], 'fr': ['Mi-28', 'Ka-52', 'AH-64 Apache', 'Mi-24']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'Mi-28', 'fr': 'Mi-28'},
    description: {'en': 'The Mil Mi-28 is a Russian all-weather, day-night, military tandem, two-seat anti-armor attack helicopter.', 'fr': 'Le Mil Mi-28 est un hélicoptère d\'attaque anti-blindage biplace en tandem militaire russe tout temps, jour-nuit.'},
  ),
  Question(
    id: 'helicopter_3',
    category: 'helicopters',
    image: 'assets/images/Mi-26.png',
    title: {'en': 'The Mi-26 is the largest and most powerful helicopter ever to have gone into series production. True or False?', 'fr': 'Le Mi-26 est l\'hélicoptère le plus grand et le plus puissant jamais produit en série. Vrai ou faux?'},
    options: {'en': ['True', 'False'], 'fr': ['Vrai', 'Faux']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'True', 'fr': 'Vrai'},
    description: {'en': 'The Mil Mi-26 is a Soviet/Russian heavy transport helicopter. It is the largest and most powerful helicopter to have gone into series production.', 'fr': 'Le Mil Mi-26 est un hélicoptère de transport lourd soviétique/russe. C\'est l\'hélicoptère le plus grand et le plus puissant jamais produit en série.'},
  ),
  Question(
    id: 'helicopter_4',
    category: 'helicopters',
    image: 'assets/images/Mi-8.png',
    title: {'en': 'What is this helicopter?', 'fr': 'Quel est cet hélicoptère ?'},
    options: {'en': ['Mi-8', 'Mi-24', 'Mi-26', 'Mi-28'], 'fr': ['Mi-8', 'Mi-24', 'Mi-26', 'Mi-28']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'Mi-8', 'fr': 'Mi-8'},
    description: {'en': 'The Mil Mi-8 is a medium twin-turbine helicopter, originally designed by the Soviet Union, and now produced by Russia.', 'fr': 'Le Mil Mi-8 est un hélicoptère bi-turbine moyen, conçu à l\'origine par l\'Union soviétique et maintenant produit par la Russie.'},
  ),
  Question(
    id: 'helicopter_5',
    category: 'helicopters',
    image: 'assets/images/Ka-52.png',
    title: {'en': 'Identify this helicopter.', 'fr': 'Identifiez cet hélicoptère.'},
    options: {'en': ['Ka-52', 'Mi-28', 'AH-64 Apache', 'Mi-24'], 'fr': ['Ka-52', 'Mi-28', 'AH-64 Apache', 'Mi-24']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'Ka-52', 'fr': 'Ka-52'},
    description: {'en': 'The Kamov Ka-52 "Alligator" is a Russian scout-attack helicopter.', 'fr': 'Le Kamov Ka-52 "Alligator" est un hélicoptère d\'attaque et de reconnaissance russe.'},
  ),
    Question(
    id: 'helicopter_6',
    category: 'helicopters',
    image: 'assets/images/Ka-52.png',
    title: {'en': 'What is the primary role of the Ka-52 "Alligator"?', 'fr': 'Quel est le rôle principal du Ka-52 "Alligator" ?'},
    options: {'en': ['Scout and attack', 'Troop transport', 'Medical evacuation', 'Anti-submarine warfare'], 'fr': ['Reconnaissance et attaque', 'Transport de troupes', 'Évacuation médicale', 'Guerre anti-sous-marine']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'Scout and attack', 'fr': 'Reconnaissance et attaque'},
    description: {'en': 'The Ka-52 "Alligator" is a scout-attack helicopter, designed for reconnaissance and engaging enemy forces.', 'fr': 'Le Ka-52 "Alligator" est un hélicoptère de reconnaissance et d\'attaque, conçu pour la reconnaissance et l\'engagement des forces ennemies.'},
  ),


  // Category: Weapons
  Question(
    id: 'weapon_1',
    category: 'weapons',
    image: 'assets/images/AKM.png',
    title: {'en': 'Identify the weapon.', 'fr': 'Identifiez l\'arme.'},
    options: {'en': ['AKM', 'AK-74', 'M4 Carbine', 'G36'], 'fr': ['AKM', 'AK-74', 'M4 Carbine', 'G36']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'AKM', 'fr': 'AKM'},
    description: {'en': 'The AKM is a 7.62x39mm assault rifle designed by Mikhail Kalashnikov. It is a modernized variant of the AK-47.', 'fr': 'L\'AKM est un fusil d\'assaut de 7,62x39 mm conçu par Mikhail Kalashnikov. C\'est une variante modernisée de l\'AK-47.'},
  ),
  Question(
    id: 'weapon_2',
    category: 'weapons',
    image: 'assets/images/SVD.png',
    title: {'en': 'What type of weapon is this?', 'fr': 'Quel type d\'arme est-ce ?'},
    options: {'en': ['Designated Marksman Rifle', 'Assault Rifle', 'Submachine Gun', 'General-purpose Machine Gun'], 'fr': ['Fusil de tireur d\'élite désigné', 'Fusil d\'assaut', 'Pistolet-mitrailleur', 'Mitrailleuse polyvalente']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'Designated Marksman Rifle', 'fr': 'Fusil de tireur d\'élite désigné'},
    description: {'en': 'The SVD (Dragunov sniper rifle) is a semi-automatic designated marksman rifle chambered in 7.62x54mmR.', 'fr': 'Le SVD (fusil de sniper Dragunov) est un fusil de tireur d\'élite désigné semi-automatique chambré en 7,62x54mmR.'},
  ),
  Question(
    id: 'weapon_3',
    category: 'weapons',
    image: 'assets/images/RPG_7.png',
    title: {'en': 'Identify this weapon.', 'fr': 'Identifiez cette arme.'},
    options: {'en': ['RPG-7', 'M72 LAW', 'AT4', 'Panzerfaust 3'], 'fr': ['RPG-7', 'M72 LAW', 'AT4', 'Panzerfaust 3']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'RPG-7', 'fr': 'RPG-7'},
    description: {'en': 'The RPG-7 is a portable, reusable, unguided, shoulder-launched, anti-tank, rocket-propelled grenade launcher.', 'fr': 'Le RPG-7 est un lance-roquettes antichar portable, réutilisable, non guidé, lancé à l\'épaule.'},
  ),
  Question(
    id: 'weapon_4',
    category: 'weapons',
    image: 'assets/images/PKM.png',
    title: {'en': 'This weapon is a...', 'fr': 'Cette arme est une...'},
    options: {'en': ['General-purpose machine gun', 'Heavy machine gun', 'Light machine gun', 'Assault rifle'], 'fr': ['Mitrailleuse polyvalente', 'Mitrailleuse lourde', 'Mitrailleuse légère', 'Fusil d\'assaut']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'General-purpose machine gun', 'fr': 'Mitrailleuse polyvalente'},
    description: {'en': 'The PKM is a 7.62x54mmR general-purpose machine gun designed in the Soviet Union.', 'fr': 'La PKM est une mitrailleuse polyvalente de 7,62x54mmR conçue en Union soviétique.'},
  ),
    Question(
    id: 'weapon_5',
    category: 'weapons',
    image: 'assets/images/RPK.png',
    title: {'en': 'Identify this weapon.', 'fr': 'Identifiez cette arme.'},
    options: {'en': ['RPK', 'M249 SAW', 'PKM', 'AK-47'], 'fr': ['RPK', 'M249 SAW', 'PKM', 'AK-47']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'RPK', 'fr': 'RPK'},
    description: {'en': 'The RPK is a 7.62x39mm light machine gun of Soviet design.', 'fr': 'Le RPK est une mitrailleuse légère de 7,62x39 mm de conception soviétique.'},
  ),
  Question(
    id: 'weapon_6',
    category: 'weapons',
    image: 'assets/images/AGS_17.png',
    title: {'en': 'Identify this weapon.', 'fr': 'Identifiez cette arme.'},
    options: {'en': ['AGS-17', 'MK19', 'AGS-30', 'H&K GMG'], 'fr': ['AGS-17', 'MK19', 'AGS-30', 'H&K GMG']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': 'AGS-17', 'fr': 'AGS-17'},
    description: {'en': 'The AGS-17 Plamya is a Soviet-designed automatic grenade launcher in service worldwide.', 'fr': 'L\'AGS-17 Plamya est un lance-grenades automatique de conception soviétique en service dans le monde entier.'},
  ),
  Question(
    id: 'weapon_7',
    category: 'weapons',
    image: 'assets/images/AKM.png',
    title: {'en': 'What caliber bullet does the AKM use?', 'fr': 'Quel calibre de balle l\'AKM utilise-t-il ?'},
    options: {'en': ['7.62x39mm', '5.45x39mm', '7.62x51mm', '5.56x45mm'], 'fr': ['7,62x39 mm', '5,45x39 mm', '7,62x51 mm', '5,56x45 mm']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': '7.62x39mm', 'fr': '7,62x39 mm'},
    description: {'en': 'The AKM assault rifle is chambered for the 7.62x39mm cartridge.', 'fr': 'Le fusil d\'assaut AKM est chambré pour la cartouche de 7,62x39 mm.'},
  ),
  Question(
    id: 'weapon_8',
    category: 'weapons',
    image: 'assets/images/SVD.png',
    title: {'en': 'What type of ammunition is used by the SVD?', 'fr': 'Quel type de munitions est utilisé par le SVD ?'},
    options: {'en': ['7.62x54mmR', '7.62x51mm NATO', '7.62x39mm', '.308 Winchester'], 'fr': ['7,62x54mmR', '7,62x51mm OTAN', '7,62x39 mm', '.308 Winchester']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': '7.62x54mmR', 'fr': '7,62x54mmR'},
    description: {'en': 'The SVD (Dragunov sniper rifle) uses the 7.62x54mmR cartridge.', 'fr': 'Le SVD (fusil de sniper Dragunov) utilise la cartouche 7,62x54mmR.'},
  ),
  Question(
    id: 'weapon_9',
    category: 'weapons',
    image: 'assets/images/PKM.png',
    title: {'en': 'What caliber is the PKM machine gun?', 'fr': 'Quel est le calibre de la mitrailleuse PKM ?'},
    options: {'en': ['7.62x54mmR', '7.62x39mm', '5.45x39mm', '7.62x51mm NATO'], 'fr': ['7,62x54mmR', '7,62x39 mm', '5,45x39 mm', '7,62x51mm OTAN']},
    correctAnswerIndex: 0,
    correctAnswer: {'en': '7.62x54mmR', 'fr': '7,62x54mmR'},
    description: {'en': 'The PKM general-purpose machine gun is chambered for the 7.62x54mmR round.', 'fr': 'La mitrailleuse polyvalente PKM est chambrée pour la munition 7,62x54mmR.'},
  )
];
