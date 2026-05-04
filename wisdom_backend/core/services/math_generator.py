import random
import hashlib
import json
import math
from fractions import Fraction

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

    def _format_term(self, coef, exp, is_first=False):
        if coef == 0:
            return ""
        
        term = ""
        if coef > 0 and not is_first:
            term += " + "
        elif coef < 0:
            if is_first:
                term += "-"
            else:
                term += " - "
        
        abs_coef = abs(coef)
        # Se coef for 1 ou -1, e exp > 0, omitimos o 1. Exceto se exp for 0.
        if abs_coef != 1 or exp == 0:
            # Handle float coefficients for integrals
            if isinstance(abs_coef, float) and abs_coef.is_integer():
                term += str(int(abs_coef))
            else:
                term += str(abs_coef)
        
        if exp > 0:
            term += "x"
        if exp > 1:
            term += f"^{{{exp}}}"
        
        return term

    def _generate_algebra_basica(self):
        # x + a = b ou ax + b = c
        mode = random.randint(1, 2)
        if mode == 1:
            a = random.randint(1, 20)
            x = random.randint(1, 20)
            b = x + a
            params = {"a": a, "b": b, "type": "x+a=b"}
            enunciado = f"Encontre o valor de $x$ na equação: $x + {a} = {b}$"
            resposta_correta = f"${x}$"
        else:
            a = random.randint(2, 5)
            x = random.randint(1, 10)
            b = random.randint(1, 20)
            c = a * x + b
            params = {"a": a, "b": b, "c": c, "type": "ax+b=c"}
            enunciado = f"Determine o valor de $x$ que satisfaz a igualdade: ${a}x + {b} = {c}$"
            resposta_correta = f"${x}$"
            
        opcoes = {resposta_correta}
        while len(opcoes) < 4:
            errada = random.randint(max(1, x-10), x+10)
            opcoes.add(f"${errada}$")
            
        opcoes_lista = list(opcoes)
        random.shuffle(opcoes_lista)
        
        return {
            "enunciado": enunciado,
            "opcoes": opcoes_lista,
            "resposta_correta": resposta_correta,
            "hash": self._generate_hash("algebra_basica", params)
        }

    def _generate_calculo_basico(self):
        mode = random.randint(1, 4) # 1: Derivada Polinomial, 2: Regras de Derivada, 3: Integral, 4: Soma Mista
        
        if mode == 1:
            # Derivada Polinomial
            terms_count = random.randint(2, 3)
            func_str = ""
            deriv_str = ""
            is_first = True
            params_terms = []
            
            # Start from high degree to low
            start_deg = random.randint(2, 4)
            for i in range(start_deg, -1, -1):
                if len(params_terms) >= terms_count: break
                coef = random.randint(-9, 9)
                if coef == 0: continue
                
                func_str += self._format_term(coef, i, is_first)
                if i > 0:
                    deriv_str += self._format_term(coef * i, i - 1, is_first)
                is_first = False
                params_terms.append((coef, i))
            
            if not deriv_str: deriv_str = "0"
            enunciado = f"Calcule a derivada de: $f(x) = {func_str}$"
            resposta_correta = f"$f'(x) = {deriv_str}$"
            params = {"type": "derivative_poly", "terms": params_terms}
            
        elif mode == 2:
            # Regras de Derivada (Produto ou Cadeia)
            sub_mode = random.randint(1, 2)
            if sub_mode == 1: # Produto
                n = random.randint(1, 3)
                term1 = "x" if n == 1 else f"x^{n}"
                term1D = "1" if n == 1 else f"{n}x^{n-1}"
                
                func_type = random.choice(["sin", "exp"])
                if func_type == "sin":
                    term2, term2D = "\\sin(x)", "\\cos(x)"
                else:
                    term2, term2D = "e^x", "e^x"
                
                enunciado = f"Calcule a derivada de: $f(x) = {term1} \\cdot {term2}$"
                resposta_correta = f"${term1D}{term2} + {term1}{term2D}$"
                params = {"type": "derivative_product", "n": n, "func2": func_type}
            else: # Cadeia
                inner_mode = random.randint(1, 2)
                if inner_mode == 1: # (ax+b)^n
                    a = random.randint(2, 5)
                    b = random.randint(1, 9)
                    n = random.randint(3, 5)
                    sign = random.choice(["+", "-"])
                    inner = f"{a}x {sign} {b}"
                    enunciado = f"Calcule a derivada de: $f(x) = ({inner})^{{{n}}}$"
                    resposta_correta = f"${n*a}({inner})^{{{n-1}}}$"
                    params = {"type": "derivative_chain_poly", "a": a, "b": b, "n": n, "sign": sign}
                else: # sin(ax)
                    a = random.randint(2, 5)
                    func_type = random.choice(["sin", "cos"])
                    inner = f"{a}x"
                    if func_type == "sin":
                        enunciado = f"Calcule a derivada de: $f(x) = \\sin({inner})$"
                        resposta_correta = f"${a}\\cos({inner})$"
                    else:
                        enunciado = f"Calcule a derivada de: $f(x) = \\cos({inner})$"
                        resposta_correta = f"$-{a}\\sin({inner})$"
                    params = {"type": "derivative_chain_trig", "a": a, "func": func_type}
            
        elif mode == 3:
            # Integral Indefinida
            terms_count = random.randint(1, 2)
            func_str = ""
            integral_str = ""
            is_first = True
            params_terms = []
            
            for _ in range(terms_count):
                power = random.randint(0, 3)
                new_power = power + 1
                coef = random.randint(1, 5) * new_power
                func_str += self._format_term(coef, power, is_first)
                integral_str += self._format_term(coef // new_power, new_power, is_first)
                is_first = False
                params_terms.append((coef, power))
                
            enunciado = f"Calcule a integral: $\\int ({func_str}) \\, dx$"
            resposta_correta = f"${integral_str} + C$"
            params = {"type": "integral_simple", "terms": params_terms}
            
        else:
            # Soma Mista
            a = random.randint(2, 5)
            n = random.randint(2, 4)
            enunciado = f"Calcule a derivada de: $f(x) = {a}x^{n} + \\ln(x) + \\cos(x)$"
            resposta_correta = f"${a*n}x^{{{n-1}}} + \\frac{{1}}{{x}} - \\sin(x)$"
            params = {"type": "derivative_mixed", "a": a, "n": n}

        # Generate options (simplified for complex answers)
        opcoes = {resposta_correta}
        while len(opcoes) < 4:
            # For complex LaTeX, we can't easily generate "close" wrong answers automatically
            # So we vary some numbers
            errada = resposta_correta.replace(str(random.randint(1, 5)), str(random.randint(6, 9)))
            if errada != resposta_correta:
                opcoes.add(errada)
            else:
                opcoes.add(resposta_correta[:-1] + " + " + str(random.randint(1, 5)) + "$")
            
        opcoes_lista = list(opcoes)
        random.shuffle(opcoes_lista)
        
        return {
            "enunciado": enunciado,
            "opcoes": opcoes_lista,
            "resposta_correta": resposta_correta,
            "hash": self._generate_hash("calculo_basico", params)
        }

    def _generate_geometria(self):
        mode = random.randint(1, 2)
        if mode == 1:
            # Área de retângulo
            b = random.randint(2, 15)
            h = random.randint(2, 15)
            area = b * h
            enunciado = f"Qual a área de um retângulo com base ${b}$ e altura ${h}$?"
            resposta_correta = f"${area}$"
            params = {"b": b, "h": h, "type": "rect_area"}
        else:
            # Circunferência/Área de círculo (aproximada ou em função de pi)
            r = random.randint(2, 10)
            use_pi = random.choice([True, False])
            if use_pi:
                enunciado = f"Qual a área de um círculo com raio ${r}$? (Em função de $\\pi$)"
                resposta_correta = f"${r*r}\\pi$"
            else:
                enunciado = f"Qual o perímetro de um círculo com raio ${r}$? (Use $\\pi \\approx 3$)"
                resposta_correta = f"${2 * 3 * r}$"
            params = {"r": r, "use_pi": use_pi, "type": "circle"}
            
        opcoes = {resposta_correta}
        while len(opcoes) < 4:
            if resposta_correta[1:-1].isdigit():
                val = int(resposta_correta[1:-1])
                errada = val + random.randint(-10, 10)
                if errada > 0 and errada != val: opcoes.add(f"${errada}$")
            else:
                opcoes.add(f"${random.randint(1, 50)}\\pi$")
            
        opcoes_lista = list(opcoes)
        random.shuffle(opcoes_lista)
        
        return {
            "enunciado": enunciado,
            "opcoes": opcoes_lista,
            "resposta_correta": resposta_correta,
            "hash": self._generate_hash("geometria", params)
        }

    def _generate_algebra_linear(self):
        mode = random.randint(1, 4) # 1: Det 2x2, 2: Dot Product, 3: Matrix Mult, 4: Linear Comb
        
        if mode == 1:
            a, b, c, d = [random.randint(-5, 5) for _ in range(4)]
            det = a*d - b*c
            enunciado = f"Calcule o determinante da matriz: $\\begin{{pmatrix}} {a} & {b} \\\\ {c} & {d} \\end{{pmatrix}}$"
            resposta_correta = f"${det}$"
            params = {"a": a, "b": b, "c": c, "d": d, "type": "det_2x2"}
        elif mode == 2:
            size = random.randint(2, 3)
            v1 = [random.randint(-5, 8) for _ in range(size)]
            v2 = [random.randint(-5, 8) for _ in range(size)]
            result = sum(a*b for a, b in zip(v1, v2))
            vec_to_tex = lambda v: f"\\begin{{pmatrix}} {' \\\\ '.join(map(str, v))} \\end{{pmatrix}}"
            enunciado = f"Calcule $u \\cdot v$: $\\quad u = {vec_to_tex(v1)}, \\; v = {vec_to_tex(v2)}$"
            resposta_correta = f"${result}$"
            params = {"v1": v1, "v2": v2, "type": "dot_product"}
        elif mode == 3:
            # 2x2 Matrix Multiplication
            a = [[random.randint(-3, 3) for _ in range(2)] for _ in range(2)]
            b = [[random.randint(-3, 3) for _ in range(2)] for _ in range(2)]
            c = [[0, 0], [0, 0]]
            for i in range(2):
                for j in range(2):
                    for k in range(2):
                        c[i][j] += a[i][k] * b[k][j]
            mat_to_tex = lambda m: f"\\begin{{pmatrix}} {m[0][0]} & {m[0][1]} \\\\ {m[1][0]} & {m[1][1]} \\end{{pmatrix}}"
            enunciado = f"Calcule $A \\times B$: $\\quad A = {mat_to_tex(a)}, \\; B = {mat_to_tex(b)}$"
            resposta_correta = f"${mat_to_tex(c)}$"
            params = {"a": a, "b": b, "type": "matrix_mult"}
        else:
            c1, c2 = random.randint(-3, 4), random.randint(-3, 4)
            v1 = [random.randint(1, 5), random.randint(-2, 2)]
            v2 = [random.randint(-2, 2), random.randint(1, 5)]
            res = [c1*v1[0] + c2*v2[0], c1*v1[1] + c2*v2[1]]
            enunciado = f"Sendo $v_1 = ({v1[0]}, {v1[1]})$ e $v_2 = ({v2[0]}, {v2[1]})$, calcule: $w = {c1}v_1 + {c2}v_2$"
            resposta_correta = f"$({res[0]}, {res[1]})$"
            params = {"c1": c1, "c2": c2, "v1": v1, "v2": v2, "type": "linear_comb"}
            
        opcoes = {resposta_correta}
        while len(opcoes) < 4:
            if resposta_correta.startswith("$\\begin{pmatrix}"):
                err_mat = [[random.randint(-20, 20) for _ in range(2)] for _ in range(2)]
                opcoes.add(f"$\\begin{{pmatrix}} {err_mat[0][0]} & {err_mat[0][1]} \\\\ {err_mat[1][0]} & {err_mat[1][1]} \\end{{pmatrix}}$")
            elif "(" in resposta_correta:
                opcoes.add(f"$({random.randint(-20, 20)}, {random.randint(-20, 20)})$")
            else:
                try:
                    val = int(resposta_correta[1:-1])
                    errada = val + random.randint(-10, 10)
                    if errada != val:
                        opcoes.add(f"${errada}$")
                except:
                    opcoes.add(f"${random.randint(-20, 20)}$")
            
        opcoes_lista = list(opcoes)
        random.shuffle(opcoes_lista)
        
        return {
            "enunciado": enunciado,
            "opcoes": opcoes_lista,
            "resposta_correta": resposta_correta,
            "hash": self._generate_hash("algebra_linear", params)
        }

    def _generate_probabilidade(self):
        # Probabilidade simples e combinatória básica
        mode = random.randint(1, 2)
        if mode == 1:
            vermelhas = random.randint(1, 10)
            azuis = random.randint(1, 10)
            total = vermelhas + azuis
            prob = Fraction(vermelhas, total)
            enunciado = f"Uma urna contém ${vermelhas}$ bolas vermelhas e ${azuis}$ bolas azuis. Qual a probabilidade de retirar uma bola vermelha?"
            resposta_correta = f"${prob.numerator}/{prob.denominator}$"
            params = {"v": vermelhas, "a": azuis, "type": "prob_balls"}
        else:
            # Lançamento de dados (soma)
            soma = random.randint(2, 12)
            # Count ways to get sum
            ways = 0
            for i in range(1, 7):
                for j in range(1, 7):
                    if i + j == soma: ways += 1
            prob = Fraction(ways, 36)
            enunciado = f"Ao lançar dois dados, qual a probabilidade da soma ser ${soma}$?"
            resposta_correta = f"${prob.numerator}/{prob.denominator}$"
            params = {"soma": soma, "type": "prob_dice"}
        
        opcoes = {resposta_correta}
        while len(opcoes) < 4:
            v_errada = random.randint(1, 10)
            d_errada = random.choice([2, 3, 4, 5, 6, 8, 10, 12, 18, 36])
            prob_errada = Fraction(v_errada, d_errada)
            opcoes.add(f"${prob_errada.numerator}/{prob_errada.denominator}$")
            
        opcoes_lista = list(opcoes)
        random.shuffle(opcoes_lista)
        
        return {
            "enunciado": enunciado,
            "opcoes": opcoes_lista,
            "resposta_correta": resposta_correta,
            "hash": self._generate_hash("probabilidade", params)
        }
