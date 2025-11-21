import 'package:flutter/material.dart';
import 'package:fge_test/l10n/app_localizations.dart';

class Category {
  final String id;
  final String Function(AppLocalizations) name;
  final IconData icon;
  final String image;

  Category({required this.id, required this.name, required this.icon, required this.image});

  static List<Category> fetchAll() {
    return [
      Category(id: 'tanks', name: (l) => "Tanks", icon: Icons.shield, image: 'assets/images/T_90.png'),
      Category(id: 'apcs', name: (l) => "Armored Personnel Carriers", icon: Icons.shield, image: 'assets/images/BMP_3.png'),
      Category(id: 'helicopters', name: (l) => "Helicopters", icon: Icons.airplanemode_active, image: 'assets/images/MI-24.png'),
      Category(id: 'weapons', name: (l) => "Individual Weapons", icon: Icons.shield, image: 'assets/images/AKM.png'),
      Category(id: 'mixed', name: (l) => "Mixed", icon: Icons.shuffle, image: 'assets/images/Mi-26.png'),
    ];
  }
}
