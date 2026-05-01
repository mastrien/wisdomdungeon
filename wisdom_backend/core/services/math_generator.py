import random
import hashlib
import json

class MathGenerator:
    def generate_question(self, topic="algebra_basica"):
        topics = {
            "algebra_basica": self._generate_algebra_basica,
            "calculo_basico": self._generate_calculo_basico,
            "geometria": self._generate_geometria,
            "algebra_linear": self._generate_algebra_linear,
            "probabilidade": self._generate_probabilidade
        }
        return topics.get(topic, lambda: {})()

    def _generate_hash(self, topic, params):
        """Gera um hash SHA-256 único para a combinação de tópico e parâmetros."""
        data = {
            "topic": topic,
            "params": params
        }
        encoded = json.dumps(data, sort_keys=True).encode()
        return hashlib.sha256(encoded).hexdigest()

    def _generate_algebra_basica(self):
        # x + a = b
        a = random.randint(1, 20)
        x = random.randint(1, 20)
        b = x + a
        
        params = {"a": a, "b": b, "type": "x+a=b"}
        enunciado = f"Resolva a equação: x + {a} = {b}"
        resposta_correta = str(x)
        
        opcoes = {resposta_correta}
        while len(opcoes) < 4:
            errada = str(random.randint(max(1, x-10), x+10))
            opcoes.add(errada)
            
        opcoes_lista = list(opcoes)
        random.shuffle(opcoes_lista)
        
        return {
            "enunciado": enunciado,
            "opcoes": opcoes_lista,
            "resposta_correta": resposta_correta,
            "hash": self._generate_hash("algebra_basica", params)
        }

    def _generate_calculo_basico(self):
        # f(x) = ax^n -> f'(x) = (a*n)x^(n-1)
        a = random.randint(1, 10)
        n = random.randint(2, 5)
        
        params = {"a": a, "n": n, "type": "derivative_power"}
        enunciado = f"Qual a derivada de f(x) = {a}x^{n}?"
        
        coef = a * n
        exp = n - 1
        resposta_correta = f"{coef}x^{exp}" if exp > 1 else f"{coef}x"
        
        opcoes = {resposta_correta}
        while len(opcoes) < 4:
            errada_coef = coef + random.randint(-3, 3)
            if errada_coef == coef: errada_coef += 1
            errada = f"{errada_coef}x^{exp}" if exp > 1 else f"{errada_coef}x"
            opcoes.add(errada)
            
        opcoes_lista = list(opcoes)
        random.shuffle(opcoes_lista)
        
        return {
            "enunciado": enunciado,
            "opcoes": opcoes_lista,
            "resposta_correta": resposta_correta,
            "hash": self._generate_hash("calculo_basico", params)
        }

    def _generate_geometria(self):
        # Área de retângulo: base * altura
        b = random.randint(2, 15)
        h = random.randint(2, 15)
        
        params = {"b": b, "h": h, "type": "rect_area"}
        enunciado = f"Qual a área de um retângulo com base {b} e altura {h}?"
        
        area = b * h
        resposta_correta = str(area)
        
        opcoes = {resposta_correta}
        while len(opcoes) < 4:
            errada = str(area + random.randint(-10, 10))
            if int(errada) > 0:
                opcoes.add(errada)
            
        opcoes_lista = list(opcoes)
        random.shuffle(opcoes_lista)
        
        return {
            "enunciado": enunciado,
            "opcoes": opcoes_lista,
            "resposta_correta": resposta_correta,
            "hash": self._generate_hash("geometria", params)
        }

    def _generate_algebra_linear(self):
        # Determinante de matriz 2x2: |a b| = ad - bc
        #                            |c d|
        a = random.randint(-5, 5)
        b = random.randint(-5, 5)
        c = random.randint(-5, 5)
        d = random.randint(-5, 5)
        
        params = {"a": a, "b": b, "c": c, "d": d, "type": "det_2x2"}
        enunciado = f"Calcule o determinante da matriz:\n[{a} {b}]\n[{c} {d}]"
        
        det = a*d - b*c
        resposta_correta = str(det)
        
        opcoes = {resposta_correta}
        while len(opcoes) < 4:
            errada = str(det + random.randint(-10, 10))
            opcoes.add(errada)
            
        opcoes_lista = list(opcoes)
        random.shuffle(opcoes_lista)
        
        return {
            "enunciado": enunciado,
            "opcoes": opcoes_lista,
            "resposta_correta": resposta_correta,
            "hash": self._generate_hash("algebra_linear", params)
        }

    def _generate_probabilidade(self):
        # Probabilidade simples: bolas em uma urna
        vermelhas = random.randint(1, 10)
        azuis = random.randint(1, 10)
        total = vermelhas + azuis
        
        params = {"v": vermelhas, "a": azuis, "type": "prob_balls"}
        enunciado = f"Uma urna contém {vermelhas} bolas vermelhas e {azuis} bolas azuis. Se uma bola for retirada ao acaso, qual a probabilidade de ela ser vermelha?"
        
        from fractions import Fraction
        prob = Fraction(vermelhas, total)
        resposta_correta = f"{prob.numerator}/{prob.denominator}"
        
        opcoes = {resposta_correta}
        while len(opcoes) < 4:
            v_errada = random.randint(1, total-1)
            prob_errada = Fraction(v_errada, total)
            opcoes.add(f"{prob_errada.numerator}/{prob_errada.denominator}")
            
        opcoes_lista = list(opcoes)
        random.shuffle(opcoes_lista)
        
        return {
            "enunciado": enunciado,
            "opcoes": opcoes_lista,
            "resposta_correta": resposta_correta,
            "hash": self._generate_hash("probabilidade", params)
        }
