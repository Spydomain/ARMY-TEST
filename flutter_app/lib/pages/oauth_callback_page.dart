
import 'package:flutter/material.dart';

class OAuthCallbackPage extends StatelessWidget {
  const OAuthCallbackPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OAuth Callback'),
      ),
      body: const Center(
        child: Text('OAuth Callback Page'),
      ),
    );
  }
}
