import math

class ProgressionService:
    @staticmethod
    def get_level_threshold(level):
        """
        XP total necessário para atingir o Nível 'level'.
        Nível 1: 0 XP
        Nível 2: 100 XP
        Nível 3: 400 XP
        Nível 4: 900 XP
        Formula: 100 * (level - 1)^2
        """
        if level <= 1:
            return 0
        return 100 * ((level - 1) ** 2)

    @staticmethod
    def get_level_for_xp(xp):
        """
        Calcula o nível baseado no XP total.
        """
        if xp < 100:
            return 1
        # xp = 100 * (level - 1)^2 => level = sqrt(xp/100) + 1
        return math.floor(math.sqrt(xp / 100)) + 1

    @staticmethod
    def get_xp_for_next_level(current_level):
        return ProgressionService.get_level_threshold(current_level + 1)

    @staticmethod
    def get_rewards_for_level(level):
        """
        Retorna as recompensas específicas para um nível atingido.
        """
        all_rewards = ProgressionService.get_rewards()
        for r in all_rewards:
            if r["level"] == level:
                return r["rewards"]
        return []

    @staticmethod
    def get_rewards():
        """
        Retorna a trilha de recompensas até o nível 30.
        """
        rewards = []
        themes = {
            1: {"id": "amber", "name": "Âmbar", "type": "theme"},
            5: {"id": "emerald", "name": "Esmeralda", "type": "theme"},
            10: {"id": "rose", "name": "Rosa", "type": "theme"},
            15: {"id": "blue", "name": "Azul", "type": "theme"},
            20: {"id": "purple", "name": "Roxo", "type": "theme"},
        }
        
        for lv in range(1, 31):
            level_reward = {"level": lv, "rewards": []}
            
            # Add Theme if exists
            if lv in themes:
                level_reward["rewards"].append({
                    "type": "theme",
                    "id": themes[lv]["id"],
                    "name": themes[lv]["name"],
                    "description": f"Desbloqueia o tema {themes[lv]['name']}"
                })
            
            # Add Gold for levels not giving themes (or every level?)
            # Let's give gold every level to make it rewarding
            gold_amount = lv * 50
            level_reward["rewards"].append({
                "type": "gold",
                "amount": gold_amount,
                "description": f"{gold_amount} moedas de ouro"
            })
            
            rewards.append(level_reward)
            
        return rewards
