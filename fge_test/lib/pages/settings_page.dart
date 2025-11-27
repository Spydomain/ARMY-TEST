
import 'package:flutter/material.dart';
import 'package:fge_test/l10n/app_localizations.dart';
import 'package:fge_test/providers/settings_provider.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  Future<void> _logout(BuildContext context) async {
    final l = AppLocalizations.of(context);
    if (l == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.logout),
        content: Text(l.areYouSureYouWantToLogout),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l.logout),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final googleSignIn = GoogleSignIn();
      await googleSignIn.signOut();

      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('isLoggedIn', false);
      await prefs.remove('displayName');
      await prefs.remove('email');
      await prefs.remove('photoUrl');

      if (!context.mounted) return;
      Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final settingsProvider = Provider.of<SettingsProvider>(context);
    final l = AppLocalizations.of(context);

    if (l == null) {
      return const Scaffold(
        body: Center(
          child: Text('Error: Localizations not found.'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l.settings),
      ),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.color_lens_outlined),
            title: Text(l.theme),
            trailing: DropdownButton<ThemeMode>(
              value: settingsProvider.themeMode,
              onChanged: (ThemeMode? themeMode) {
                if (themeMode != null) {
                  settingsProvider.setTheme(themeMode);
                }
              },
              items: [
                DropdownMenuItem(
                  value: ThemeMode.light,
                  child: Text(l.light),
                ),
                DropdownMenuItem(
                  value: ThemeMode.dark,
                  child: Text(l.dark),
                ),
                DropdownMenuItem(
                  value: ThemeMode.system,
                  child: Text(l.system),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          ListTile(
            leading: const Icon(Icons.language),
            title: Text(l.language),
            trailing: DropdownButton<Locale>(
              value: settingsProvider.locale,
              onChanged: (Locale? locale) {
                if (locale != null) {
                  settingsProvider.setLanguage(locale);
                }
              },
              items: [
                DropdownMenuItem(
                  value: const Locale('en'),
                  child: Text(l.english),
                ),
                DropdownMenuItem(
                  value: const Locale('fr'),
                  child: Text(l.french),
                ),
              ],
            ),
          ),
          const Divider(),
          ListTile(
            title: Text(l.logout),
            leading: const Icon(Icons.logout),
            onTap: () => _logout(context),
          ),
        ],
      ),
    );
  }
}
