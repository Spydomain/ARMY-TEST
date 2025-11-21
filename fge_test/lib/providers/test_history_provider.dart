
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fge_test/models/test.dart';

class TestHistoryProvider with ChangeNotifier {
  List<Test> _testHistory = [];

  List<Test> get testHistory => _testHistory;

  TestHistoryProvider() {
    _loadTestHistory();
  }

  Future<void> _loadTestHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final String? testHistoryString = prefs.getString('test_history');
    if (testHistoryString != null) {
      final List<dynamic> testHistoryJson = jsonDecode(testHistoryString);
      _testHistory = testHistoryJson.map((json) => Test.fromJson(json)).toList();
      notifyListeners();
    }
  }

  Future<void> addTest(Test test) async {
    _testHistory.add(test);
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    final String testHistoryString = jsonEncode(_testHistory.map((test) => test.toJson()).toList());
    await prefs.setString('test_history', testHistoryString);
  }

  Future<void> clearHistory() async {
    _testHistory = [];
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('test_history');
  }
}
