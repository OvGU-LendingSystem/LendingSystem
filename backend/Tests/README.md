# How to write a TEST
- Define a new function in run_test.py like so:
```python
def test_name(self):
    <file_in_testfolder>.<test_name>(self.client, test_db)
```
- Define the test in a file in the testfolder
  - if you need more testcases than already defined in the testDB_base then add things to this
  - now define a query (you can also use fragments here --> fragments.py)
    ```python
    executed = client.execute('''
        query{
            <query_name>{
                <requested_data>
                <fragment>
            }
        }''' + <fragment>)
    ```
  - use the to_std_dicts function to sort your return value and define the expected value as a dict
    ```python
        result = to_std_dicts(executed)
        expected = {
            'data': {
                <expected_data>
            }
        } # this should be already sorted ELSE it has to be put into to_std_dicts before the assertion
    ```
  - now write an assertion and give it a msg to be printed if it would fail
    ```python
        msg = "<query_name> failed"
        assert(result == expected), msg
    ```
    - you can write as many assertions per test as you like