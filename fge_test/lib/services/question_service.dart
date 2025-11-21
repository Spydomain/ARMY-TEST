import 'package:shared_preferences/shared_preferences.dart';

class QuestionService {
  static const String _answeredQuestionsKey = 'answeredQuestions';

  Future<List<String>> getAnsweredQuestions(String categoryId) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final List<String> answeredQuestions = prefs.getStringList('$_answeredQuestionsKey/$categoryId') ?? [];
    return answeredQuestions;
  }

  Future<void> saveAnsweredQuestions(String categoryId, List<String> answeredQuestions) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('$_answeredQuestionsKey/$categoryId', answeredQuestions);
  }
}
