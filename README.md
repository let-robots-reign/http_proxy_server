# HTTP Proxy сервер

Написать http прокси сервер и простой сканер уязвимости на его основе.

1. Проксирование HTTP запросов – 5 баллов
2. Проксирование HTTPS запросов – 5 баллов
3. Повторная отправка проксированных запросов – 5 баллов
4. Сканер уязвимости – 5 баллов
```
Вариант 3. XXE - если в запросе есть XML (строчка <?xml ...), вместо него вставить 
<!DOCTYPE foo [
  <!ELEMENT foo ANY >
  <!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
<foo>&xxe;</foo>
поискать в ответе строчку "root:", если нашлась, писать, что запрос уязвим
```

# How To Run
```
docker build -t proxy .
docker run -p 8000:8000 -p 8080:8080 proxy
```

При ошибке Permission Denied выполнить
```
chmod +x ./gen_ca.sh
```
Затем повторить сборку контейнера.
