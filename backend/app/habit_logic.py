from collections import defaultdict

def format_heatmap_data(logs):
    """
    Transforms a list of HabitLog objects into a dictionary format
    suitable for a heatmap visualization.
    
    Args:
        logs (list[HabitLog]): List of HabitLog objects.
        
    Returns:
        dict: A dictionary where keys are dates (YYYY-MM-DD) and values are counts/intensities.
              Example: { '2025-10-25': 1 }
    """
    heatmap_data = defaultdict(int)
    
    for log in logs:
        if log.completed:
            date_str = log.completion_date.isoformat()
            # For a boolean completion, we might just mark it as 1.
            # If multiple logs per day were possible (e.g. drank water 3 times), we sum.
            # The HabitLog model has 'completed' boolean.
            # Assuming one log entry per completion event.
            heatmap_data[date_str] += 1
            
    return dict(heatmap_data)

