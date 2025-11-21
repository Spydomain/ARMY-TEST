
import 'package:flutter/material.dart';
import 'package:fge_test/l10n/app_localizations.dart';
import 'package:fge_test/pages/home_page.dart';
import 'package:fge_test/pages/login_page.dart';
import 'package:fge_test/pages/results_page.dart';
import 'package:fge_test/pages/test_history_page.dart';
import 'package:fge_test/providers/settings_provider.dart';
import 'package:fge_test/providers/test_history_provider.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

  runApp(MyApp(isLoggedIn: isLoggedIn));
}

class MyApp extends StatelessWidget {
  final bool isLoggedIn;

  const MyApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => SettingsProvider()),
        ChangeNotifierProvider(create: (context) => TestHistoryProvider()),
      ],
      child: Consumer<SettingsProvider>(
        builder: (context, settings, child) {
          return MaterialApp(
            title: 'FGE Identification Test Platform',
            theme: ThemeData(
              brightness: Brightness.light,
              primarySwatch: Colors.blue,
              visualDensity: VisualDensity.adaptivePlatformDensity,
            ),
            darkTheme: ThemeData(
              brightness: Brightness.dark,
              primarySwatch: Colors.blue,
              visualDensity: VisualDensity.adaptivePlatformDensity,
            ),
            themeMode: settings.themeMode,
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
            locale: settings.locale,
            initialRoute: isLoggedIn ? '/' : '/login',
            routes: {
              '/': (context) => const HomePage(),
              '/login': (context) => const LoginPage(),
              '/results': (context) => const ResultsPage(),
              '/history': (context) => const TestHistoryPage(),
            },
          );
        },
      ),
    );
  }
}
