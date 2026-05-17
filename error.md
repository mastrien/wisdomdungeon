[17/May/2026 01:08:19] "GET /api/dungeon/current/?topic=algebra_basica&type=normal HTTP/1.1" 500 100636
Internal Server Error: /api/dungeon/current/
Traceback (most recent call last):
  File "C:\Users\G51 Informática\AppData\Local\Programs\Python\Python313\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\G51 Informática\AppData\Local\Programs\Python\Python313\Lib\site-packages\django\core\handlers\base.py", line 197, in _get_response
    response = wrapped_callback(request, *callback_args, **callback_kwargs)
  File "C:\Users\G51 Informática\AppData\Local\Programs\Python\Python313\Lib\site-packages\django\views\decorators\csrf.py", line 65, in _view_wrapper
    return view_func(request, *args, **kwargs)
  File "C:\Users\G51 Informática\AppData\Local\Programs\Python\Python313\Lib\site-packages\django\views\generic\base.py", line 105, in view
    return self.dispatch(request, *args, **kwargs)
           ~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\G51 Informática\AppData\Local\Programs\Python\Python313\Lib\site-packages\rest_framework\views.py", line 515, in dispatch
    response = self.handle_exception(exc)
  File "C:\Users\G51 Informática\AppData\Local\Programs\Python\Python313\Lib\site-packages\rest_framework\views.py", line 475, in handle_exception
    self.raise_uncaught_exception(exc)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^
  File "C:\Users\G51 Informática\AppData\Local\Programs\Python\Python313\Lib\site-packages\rest_framework\views.py", line 486, in raise_uncaught_exception
    raise exc
  File "C:\Users\G51 Informática\AppData\Local\Programs\Python\Python313\Lib\site-packages\rest_framework\views.py", line 512, in dispatch
    response = handler(request, *args, **kwargs)
  File "C:\root_lab\antigravity\wisdomdungeon\wisdom_backend\core\views.py", line 197, in get
    question = room.questions.all()[progress.current_question_index]
               ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\G51 Informática\AppData\Local\Programs\Python\Python313\Lib\site-packages\django\db\models\query.py", line 436, in __getitem__
    return qs._result_cache[0]
           ~~~~~~~~~~~~~~~~^^^
IndexError: list index out of range
[17/May/2026 01:08:19] "GET /api/dungeon/current/?topic=algebra_basica&type=normal HTTP/1.1" 500 100636