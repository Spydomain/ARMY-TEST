
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsProvider with ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;
  Locale _locale = const Locale('en');

  ThemeMode get themeMode => _themeMode;
  Locale get locale => _locale;

  SettingsProvider() {
    _loadSettings();
  }

  void _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final theme = prefs.getString('theme') ?? 'system';
    final language = prefs.getString('language') ?? 'en';

    _themeMode = {
      'light': ThemeMode.light,
      'dark': ThemeMode.dark,
    }[theme] ??
        ThemeMode.system;

    _locale = Locale(language);
    notifyListeners();
  }

  void setTheme(ThemeMode themeMode) async {
    _themeMode = themeMode;
    final prefs = await SharedPreferences.getInstance();
    prefs.setString(
        'theme',
        {
          ThemeMode.light: 'light',
          ThemeMode.dark: 'dark',
        }[themeMode] ??
            'system');
    notifyListeners();
  }

  void setLanguage(Locale locale) async {
    _locale = locale;
    final prefs = await SharedPreferences.getInstance();
    prefs.setString('language', locale.languageCode);
    notifyListeners();
  }
}
